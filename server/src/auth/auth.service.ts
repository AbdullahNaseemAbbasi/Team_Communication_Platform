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

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      displayName: dto.displayName,
      emailVerified: false,
      otpCode: otp,
      otpExpiry,
    });

    await this.emailService.sendOtpEmail(user.email, user.displayName, otp);

    return {
      message: 'Account created! Check your email for the verification code.',
      email: user.email,
    };
  }

  async verifyEmail(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }
    if (!user.otpCode || user.otpCode !== dto.otp) {
      throw new BadRequestException('Invalid OTP code');
    }
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    await this.usersService.updateById(user._id.toString(), {
      emailVerified: true,
      otpCode: null,
      otpExpiry: null,
    });

    return { message: 'Email verified successfully! You can now log in.' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedException('This account uses Google sign-in');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokens(user._id.toString(), user.email);
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException();

      return this.generateTokens(user._id.toString(), user.email);
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  async validateGoogleUser(googleProfile: {
    googleId: string;
    email: string;
    displayName: string;
    avatar: string;
  }) {
    let user = await this.usersService.findByGoogleId(googleProfile.googleId);

    if (!user) {
      user = await this.usersService.findByEmail(googleProfile.email);

      if (user) {
        user = await this.usersService.updateById(user._id.toString(), {
          googleId: googleProfile.googleId,
          emailVerified: true,
          avatar: user.avatar || googleProfile.avatar,
        });
      } else {
        user = await this.usersService.create({
          email: googleProfile.email,
          googleId: googleProfile.googleId,
          displayName: googleProfile.displayName,
          avatar: googleProfile.avatar,
          emailVerified: true,
          password: null,
        });
      }
    }

    return this.generateTokens(user!._id.toString(), user!.email);
  }
}
