import { Readable } from "stream";
import { cloudinary } from "../config/cloudinary";
import { env } from "../config/env";
import { AppError } from "../utils/appError";

function uploadBuffer(file: Express.Multer.File, folder: string) {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError("Cloudinary is not configured", 503, "CLOUDINARY_NOT_CONFIGURED");
  }
  return new Promise<{ url: string; publicId: string; width: number; height: number }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", transformation: [{ quality: "auto", fetch_format: "auto" }] },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height });
      }
    );
    Readable.from(file.buffer).pipe(stream);
  });
}

export const uploadService = {
  async uploadImages(files: Express.Multer.File[], folder = "food-review/posts") {
    if (!files.length) throw new AppError("At least one image is required", 400, "NO_FILES");
    return Promise.all(files.map((file) => uploadBuffer(file, folder)));
  }
};
