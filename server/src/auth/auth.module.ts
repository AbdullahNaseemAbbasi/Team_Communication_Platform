import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // UsersModule import karo taake UsersService inject ho sake
    UsersModule,

    // PassportModule — authentication strategies ke liye base
    PassportModule,

    // JwtModule — JWT tokens banana aur verify karna
    // register() mein default config dete hain
    // (individual token generate karte waqt secret override kar sakte hain)
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,    // JWT protected routes ke liye
    GoogleStrategy, // Google OAuth ke liye
  ],
})
export class AuthModule {}
