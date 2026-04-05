import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

// ── JWT Strategy kya hai? ──────────────────────────────────────────────────────
// Jab koi protected route pe request aati hai, Passport yeh strategy run karta hai:
// 1. Request ke Authorization header se Bearer token nikalta hai
// 2. Token ko JWT_SECRET se verify karta hai (tampered nahi hua?)
// 3. Token ka payload (userId, email) nikalta hai
// 4. validate() method call karta hai
// 5. validate() ka return value req.user mein aa jaata hai
//
// Iske baad controller mein @Request() req se user mil jaata hai
// Yahi mechanism Slack use karta hai — har API call mein token verify hota hai

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  // 'jwt' = strategy ka naam — @UseGuards(AuthGuard('jwt')) mein yahi naam use hoga

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      // Request ke Authorization: Bearer <token> header se token nikalo
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Expire token pe error do — ignore mat karo
      ignoreExpiration: false,
      // Same secret jo token banate waqt use kiya tha
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // ── validate() ──────────────────────────────────────────────────────────────
  // Token valid hai — payload yahan milta hai
  // payload.sub = userId (sub = JWT standard mein subject)
  // Yahan hum database se fresh user fetch karte hain
  // Kyun? Token mein saved data stale ho sakta hai (user banned ho gaya, etc.)
  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Token valid nahi hai');
    }

    // Yeh return value req.user ban jaata hai controller mein
    return { id: user._id.toString(), email: user.email, displayName: user.displayName };
  }
}
