/**
 * Validates required environment variables at startup.
 * Fails fast with a clear error listing everything that is missing,
 * instead of crashing later with cryptic errors.
 */
export function validateEnv(config: Record<string, unknown>) {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM',
  ];

  const missing = required.filter((key) => {
    const value = config[key];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n` +
        missing.map((key) => `  - ${key}`).join('\n') +
        `\n\nPlease check your .env file or deployment platform's environment settings.`,
    );
  }

  // JWT secrets should be sufficiently long for security
  const jwtSecret = config.JWT_SECRET as string;
  const jwtRefreshSecret = config.JWT_REFRESH_SECRET as string;

  if (jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long. ' +
        'Generate a secure one with: openssl rand -base64 48',
    );
  }

  if (jwtRefreshSecret.length < 32) {
    throw new Error(
      'JWT_REFRESH_SECRET must be at least 32 characters long. ' +
        'Generate a secure one with: openssl rand -base64 48',
    );
  }

  if (jwtSecret === jwtRefreshSecret) {
    throw new Error(
      'JWT_SECRET and JWT_REFRESH_SECRET must be different values.',
    );
  }

  return config;
}
