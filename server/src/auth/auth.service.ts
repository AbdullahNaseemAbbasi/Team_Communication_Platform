import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  // ────────────────────────────────────────────────────────────────────────────
  // REGISTER
  // ────────────────────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // 1. Email already exist karta hai? Check karo
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      // ConflictException = HTTP 409 — "yeh resource already exist karta hai"
      throw new ConflictException('Is email se account pehle se exist karta hai');
    }

    // 2. Password hash karo bcrypt se
    // ── Bcrypt kya karta hai? ──────────────────────────────────────────────
    // Plain text password kabhi save nahi karte — agar database leak ho toh sab exposed
    // bcrypt password ko ek random "salt" ke saath mix karke ek fixed-length hash banata hai
    // "password123" → "$2b$10$abc...xyz" (60 char hash)
    // Hash se original password wapas nahi aa sakta (one-way function)
    // Slack bhi yehi karta hai — tumhara password Slack ko bhi nahi pata
    // 10 = "salt rounds" — jitna zyada, utna secure (but slow). 10 industry standard hai
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. 6-digit OTP generate karo — email verification ke liye
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 4. User create karo database mein
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      displayName: dto.displayName,
      emailVerified: false, // Abhi verify nahi hua
      otpCode: otp,
      otpExpiry,
    });

    // 5. OTP email bhejo
    await this.emailService.sendOtpEmail(user.email, user.displayName, otp);

    return {
      message: 'Account ban gaya! Email check karo aur OTP se verify karo.',
      email: user.email,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // VERIFY EMAIL (OTP)
  // ────────────────────────────────────────────────────────────────────────────
  async verifyEmail(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User nahi mila');
    }
    if (user.emailVerified) {
      throw new BadRequestException('Email pehle se verify hai');
    }
    if (!user.otpCode || user.otpCode !== dto.otp) {
      throw new BadRequestException('OTP galat hai');
    }
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expire ho gaya — dobara bhejwa lo');
    }

    // OTP sahi hai — email verify karo aur OTP clear karo
    await this.usersService.updateById(user._id.toString(), {
      emailVerified: true,
      otpCode: null,
      otpExpiry: null,
    });

    return { message: 'Email verify ho gaya! Ab login kar sakte ho.' };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // LOGIN
  // ────────────────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    // 1. User dhundho
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // Security tip: "email nahi mila" aur "password galat" same error do
      // Warna attacker ko pata chal jaata hai kaun sa email registered hai
      throw new UnauthorizedException('Email ya password galat hai');
    }

    // 2. Google OAuth user password se login karne ki koshish kar raha hai?
    if (!user.password) {
      throw new UnauthorizedException('Yeh account Google se bana tha — Google se login karo');
    }

    // 3. Email verify hua?
    if (!user.emailVerified) {
      throw new UnauthorizedException('Pehle email verify karo');
    }

    // 4. Password compare karo
    // bcrypt.compare() → entered password ko stored hash se compare karta hai
    // Internally same hashing process apply karta hai aur compare karta hai
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ya password galat hai');
    }

    // 5. Tokens generate karo
    return this.generateTokens(user._id.toString(), user.email);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TOKENS GENERATE KARNA
  // ────────────────────────────────────────────────────────────────────────────
  // ── JWT kya hai? ───────────────────────────────────────────────────────────
  // JSON Web Token — ek signed string jo user ki identity prove karta hai
  // Structure: header.payload.signature
  // Payload mein: userId, email, token type
  // Signature: secret key se sign kiya — server verify kar sakta hai tamper nahi hua
  //
  // Access Token (15 min) → Har API request mein bhejte hain Authorization header mein
  // Refresh Token (7 days) → Sirf naya access token lene ke liye use hota hai
  //
  // Kyun do tokens? Security!
  // Agar access token leak ho → 15 min mein expire ho jaayega
  // Agar sirf ek long-lived token hota → leak hone pe weeks tak attacker access kar sakta
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    // sub = "subject" — JWT standard mein user ID yahan jaati hai

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'), // 15m
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'), // 7d
    });

    return { accessToken, refreshToken };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // REFRESH TOKEN → NEW ACCESS TOKEN
  // ────────────────────────────────────────────────────────────────────────────
  async refreshAccessToken(refreshToken: string) {
    try {
      // Refresh token verify karo
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // User abhi bhi exist karta hai?
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException();

      // Naya access token do
      return this.generateTokens(user._id.toString(), user.email);
    } catch {
      throw new UnauthorizedException('Refresh token invalid ya expire ho gaya');
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GOOGLE OAUTH — User validate karna (Passport strategy call karega)
  // ────────────────────────────────────────────────────────────────────────────
  async validateGoogleUser(googleProfile: {
    googleId: string;
    email: string;
    displayName: string;
    avatar: string;
  }) {
    // Pehle Google ID se dhundho
    let user = await this.usersService.findByGoogleId(googleProfile.googleId);

    if (!user) {
      // Email se check karo — same email se pehle manual account bana tha?
      user = await this.usersService.findByEmail(googleProfile.email);

      if (user) {
        // Existing user ka Google ID link karo
        user = await this.usersService.updateById(user._id.toString(), {
          googleId: googleProfile.googleId,
          emailVerified: true,
          avatar: user.avatar || googleProfile.avatar,
        });
      } else {
        // Bilkul naya user — Google se pehli baar
        user = await this.usersService.create({
          email: googleProfile.email,
          googleId: googleProfile.googleId,
          displayName: googleProfile.displayName,
          avatar: googleProfile.avatar,
          emailVerified: true, // Google email already verified hoti hai
          password: null,
        });
      }
    }

    return this.generateTokens(user!._id.toString(), user!.email);
  }
}
