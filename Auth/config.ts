const optionalEnv = (name: string): string => process.env[name] ?? "";

export const config = {
  REGION: process.env.AWS_REGION ?? process.env.REGION ?? "ap-south-1",
  USER_POOL_ID: optionalEnv("USER_POOL_ID"),
  APP_CLIENT_ID: optionalEnv("APP_CLIENT_ID"),
  IDENTITY_POOL_ID: optionalEnv("IDENTITY_POOL_ID"),
};
