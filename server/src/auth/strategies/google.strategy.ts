import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

// ── Google OAuth kaise kaam karta hai? ────────────────────────────────────────
// 1. User "Google se Login" button dabata hai
// 2. Hum user ko Google ke login page pe redirect karte hain (GET /api/auth/google)
// 3. User Google pe login karta hai aur permission deta hai
// 4. Google user ko callback URL pe redirect karta hai + ek "code" deta hai
// 5. Hum woh code use karke Google se user ki profile info maangते hain
// 6. validate() call hoti hai profile ke saath
// 7. Hum JWT tokens generate karte hain aur frontend pe redirect karte hain

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get('GOOGLE_CALLBACK_URL')!,
      // Scopes = Google se kya info chahiye
      scope: ['email', 'profile'],
    });
  }

  // ── validate() ──────────────────────────────────────────────────────────────
  // Google successful login ke baad yeh call hoti hai
  // profile mein user ka naam, email, photo Google se aata hai
  async validate(
    _accessToken: string,    // Google ka access token (hum use nahi karte)
    _refreshToken: string,   // Google ka refresh token (hum use nahi karte)
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;

    const tokens = await this.authService.validateGoogleUser({
      googleId: id,
      email: emails[0].value,
      displayName,
      avatar: photos[0]?.value || null,
    });

    done(null, tokens);
  }
}
