import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

export function cloudinaryReady(): boolean {
  return Boolean(
    env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret,
  );
}

if (cloudinaryReady()) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

export { cloudinary };
