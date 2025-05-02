// Environment variables configuration for type safety
import "dotenv/config";

function getEnvironmentVariable(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing environment variable: ${key}`);
    }
    if (fallback !== undefined) {
      console.warn(`Using fallback for missing environment variable: ${key}`);
      return fallback;
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  SUPABASE_URL: getEnvironmentVariable(
    "SUPABASE_URL",
    "https://your-project.supabase.co"
  ),
  SUPABASE_ANON_KEY: getEnvironmentVariable(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2NDExNjM2LCJleHAiOjE5MzE5ODc2MzZ9.fallback"
  ),
  DATABASE_URL: getEnvironmentVariable(
    "DATABASE_URL",
    "postgres://postgres:postgres@localhost:5432/postgres"
  ),
  JWT_SECRET: getEnvironmentVariable(
    "JWT_SECRET",
    "development-jwt-secret-key"
  ),
} as const;
