import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  jwtSecret: required("JWT_SECRET", "dev-secret"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  databaseUrl: required("DATABASE_URL"),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  },
  admin: {
    email: process.env.ADMIN_EMAIL ?? "george.a@example.org",
    password: process.env.ADMIN_PASSWORD ?? "Admin@12345",
    name: process.env.ADMIN_NAME ?? "Divine Drops Admin",
  },
  delivery: {
    defaultFee: Number(process.env.DEFAULT_DELIVERY_FEE ?? 2),
    freeThreshold: Number(process.env.FREE_DELIVERY_THRESHOLD ?? 50),
  },
};
