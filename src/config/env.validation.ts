export function validateEnv(config: Record<string, unknown>) {
  for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
    if (!config[key]) throw new Error(`Missing environment variable: ${key}`);
  }
  return config;
}