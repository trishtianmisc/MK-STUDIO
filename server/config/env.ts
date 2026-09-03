function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  NODE_ENV: optionalEnv("NODE_ENV", "development"),
  PORT: optionalEnv("PORT", "3000"),
  SUPABASE_URL: requireEnv("SUPABASE_URL"),
  SUPABASE_ANON_KEY: requireEnv("SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  CORS_ORIGIN: optionalEnv("CORS_ORIGIN", "http://localhost:3000"),
} as const;
