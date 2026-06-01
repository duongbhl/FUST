import multer from "multer";
import { env } from "../config/env";
import { AppError } from "../utils/appError";

const storage = multer.memoryStorage();
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      cb(new AppError("Only JPEG, PNG, WEBP and GIF images are allowed", 415, "UNSUPPORTED_MEDIA_TYPE"));
      return;
    }
    cb(null, true);
  }
});
