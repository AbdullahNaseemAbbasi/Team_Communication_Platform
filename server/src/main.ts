import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── 1. Global API Prefix ──────────────────────────────────────────
  // Saare routes /api/... se shuru honge
  // Jaise: /api/auth/login, /api/workspaces, /api/messages
  // Kyun? Frontend aur Backend alag ports pe hain — /api prefix se clarity aati hai
  app.setGlobalPrefix('api');

  // ── 2. CORS (Cross-Origin Resource Sharing) ───────────────────────
  // Browser security rule: ek origin (localhost:3000) doosri origin
  // (localhost:3001)
  // Hum explicitly frontend URL ko allow kar rahe hain
  app.enableCors({ 
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Cookies/auth headers allow karo
  });

  // ── 3. Global Validation Pipe ─────────────────────────────────────
  // Har request ka body automatically validate hoga DTO classes ke basis pe
  // Jaise: email field mein valid email aana chahiye, password minimum 6 chars
  // whitelist: true → extra fields (jo DTO mein nahi hain) automatically remove ho jaaye
  // forbidNonWhitelisted: true → extra fields pe error throw karo
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // String "123" ko Number 123 mein automatically convert karo
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Server running on http://localhost:${port}/api`);
}
bootstrap();
