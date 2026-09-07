export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const isProduction = config.NODE_ENV === 'production';
  const requiredInProduction = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  if (isProduction) {
    const missing = requiredInProduction.filter(
      (key) => typeof config[key] !== 'string' || config[key] === '',
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing required production environment variables: ${missing.join(', ')}`,
      );
    }
  }

  return {
    ...config,
    MONGO_URI: config.MONGO_URI ?? 'mongodb://127.0.0.1:27017/nest-signin',
    JWT_SECRET: config.JWT_SECRET ?? 'development-secret',
    JWT_REFRESH_SECRET:
      config.JWT_REFRESH_SECRET ?? 'development-refresh-secret',
  };
}
