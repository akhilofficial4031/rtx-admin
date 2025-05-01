// Environment variables configuration for type safety
import "dotenv/config";

function getEnvironmentVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  SUPABASE_URL: getEnvironmentVariable("SUPABASE_URL"),
  SUPABASE_ANON_KEY: getEnvironmentVariable("SUPABASE_ANON_KEY"),
  DATABASE_URL: getEnvironmentVariable("DATABASE_URL"),
} as const;
