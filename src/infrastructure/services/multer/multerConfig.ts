import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import { storage } from "../../utility/cloudinay";

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (_req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|pdf|mp4/;
  const isValid =
    allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
    allowedTypes.test(file.mimetype);

  if (isValid) cb(null, true);
  else cb(new Error("Only JPEG/PNG files are allowed"));
};


export const upload = multer({ storage, fileFilter });
