import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// ── JwtAuthGuard kya hai? ─────────────────────────────────────────────────────
// Guard = darwaan. Request ko andar jane deta hai ya rok deta hai.
//
// @UseGuards(JwtAuthGuard) kisi bhi route pe lagao:
// → Valid JWT token hoga toh request andar jaayegi
// → Token nahi hoga ya invalid hoga toh 401 Unauthorized error milegi
//
// AuthGuard('jwt') → NestJS ko bolta hai "jwt" naam ki strategy use karo
// Woh strategy JwtStrategy hai jo humne upar banai

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
