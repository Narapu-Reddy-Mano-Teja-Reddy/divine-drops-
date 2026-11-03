import type { NextFunction, Request, Response } from "express";
import { cloudinary, cloudinaryReady } from "../lib/cloudinary";
import { HttpError } from "../utils/httpError";

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new HttpError(400, "Image file is required");
    if (!cloudinaryReady()) {
      throw new HttpError(503, "Cloudinary is not configured. Add credentials to .env");
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(req.file.mimetype)) {
      throw new HttpError(400, "Only JPEG, PNG, WebP and GIF images are allowed");
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "divine-drops",
      resource_type: "image",
    });

    res.json({ success: true, url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    next(err);
  }
}
