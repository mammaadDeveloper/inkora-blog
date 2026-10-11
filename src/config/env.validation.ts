export type ValidatedEnvironment = {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGIN: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
};

export function validateEnvironment(
  config: Record<string, string | undefined>,
): ValidatedEnvironment {
  const nodeEnv = config.NODE_ENV ?? 'development';
  const port = Number(config.PORT ?? '3000');
  const databaseUrl = config.DATABASE_URL?.trim();
  const accessSecret = config.JWT_ACCESS_SECRET?.trim();
  const refreshSecret = config.JWT_REFRESH_SECRET?.trim();

  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable.');
  }

  if (!accessSecret) {
    throw new Error('Missing JWT_ACCESS_SECRET environment variable.');
  }

  if (!refreshSecret) {
    throw new Error('Missing JWT_REFRESH_SECRET environment variable.');
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${config.PORT ?? '3000'}`);
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    DATABASE_URL: databaseUrl,
    CORS_ORIGIN: config.CORS_ORIGIN ?? 'http://localhost:3000',
    JWT_ACCESS_SECRET: accessSecret,
    JWT_REFRESH_SECRET: refreshSecret,
    JWT_ISSUER: config.JWT_ISSUER ?? 'inkora',
    JWT_AUDIENCE: config.JWT_AUDIENCE ?? 'inkora-api',
  };
}
