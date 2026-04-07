import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Redirect,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// @Controller('auth') → Saare routes /api/auth/... se shuru honge (prefix /api main.ts mein set tha)
@Controller('auth') 
export class AuthController {
  constructor(private authService: AuthService) {}

  // ── POST /api/auth/register ──────────────────────────────────────────────────
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    // @Body() → request body extract karta hai aur RegisterDto mein map karta hai
    // ValidationPipe automatically validate karta hai (main.ts mein set tha)
    return this.authService.register(dto);
  }

  // ── POST /api/auth/verify-email ──────────────────────────────────────────────
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyEmail(dto);
  } 

  // ── POST /api/auth/login ─────────────────────────────────────────────────────
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
    // Returns: { accessToken, refreshToken }
  }

  // ── POST /api/auth/refresh-token ─────────────────────────────────────────────
  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshAccessToken(body.refreshToken);
  } 

  // ── GET /api/auth/me (Protected Route) ──────────────────────────────────────
  // @UseGuards(JwtAuthGuard) → pehle JWT verify hoga, phir ye route chalega
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    // req.user mein JwtStrategy.validate() ka return value hai
    // { id, email, displayName }
    return req.user;
  }

  // ── GET /api/auth/google ─────────────────────────────────────────────────────
  // User yahan aata hai → Google login page pe redirect ho jaata hai
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Yeh method actually nahi chalta — Passport khud redirect kar deta hai
  }

  // ── GET /api/auth/google/callback ────────────────────────────────────────────
  // Google login ke baad Google user ko yahan redirect karta hai
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  googleCallback(@Request() req: any) {
    // req.user mein GoogleStrategy.validate() ka return (tokens) hai
    const { accessToken, refreshToken } = req.user;

    // Frontend ko tokens ke saath redirect karo
    // Frontend URL params se tokens le lega aur store kar lega
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return {
      url: `${clientUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    };
  }
}
