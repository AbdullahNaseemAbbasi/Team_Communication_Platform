import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Trust proxy headers (required for Railway/Render/Heroku reverse proxies
  // so that rate limiting and IP detection work correctly)
  const httpAdapter = app.getHttpAdapter().getInstance();
  if (typeof httpAdapter.set === 'function') {
    httpAdapter.set('trust proxy', 1);
  }

  app.setGlobalPrefix('api');

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  // Bind to 0.0.0.0 so the server is reachable on Railway/Render/Docker
  // (default Node.js binding is IPv6 localhost which fails on those platforms)
  await app.listen(port, '0.0.0.0');

  logger.log(`Server running on port ${port}`);
  logger.log(`API available at /api`);
  logger.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
