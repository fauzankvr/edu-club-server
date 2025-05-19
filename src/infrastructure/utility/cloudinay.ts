import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Allowed mimetypes
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "video/mp4",
];

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const mime = file.mimetype;

    if (!ALLOWED_TYPES.includes(mime)) {
      throw new Error("Unsupported file type");
    }

    // Determine Cloudinary resource type
    let resource_type: "image" | "video" | "raw" = "raw";

    if (mime.startsWith("image/")) resource_type = "image";
    else if (mime.startsWith("video/")) resource_type = "video";

    return {
      folder: "uploads",
      resource_type,
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});


