import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folderName = "others";

    // Organize by file type - matching original logic
    if (file.fieldname === "productImages") {
      folderName = "products";
    } else if (file.fieldname === "repairImages") {
      folderName = "repairs";
    } else if (file.fieldname === "profileImage") {
      folderName = "profiles";
    }

    return {
      folder: `ram-mobile/${folderName}`,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      public_id: `${path.basename(file.originalname, path.extname(file.originalname))}-${Date.now()}`
    };
  }
});

// File filter (CloudinaryStorage handles formats, but we can keep this for early rejection if needed, or rely on allowed_formats)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp"
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Single file upload middleware
export const uploadSingle = (fieldName = "image") => {
  return upload.single(fieldName);
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName = "images", maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Multiple fields upload middleware
export const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Product images upload
export const uploadProductImages = upload.array("productImages", 5);

// Repair images upload
export const uploadRepairImages = upload.array("repairImages", 10);

// Profile image upload
export const uploadProfileImage = upload.single("profileImage");

// Error handler for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB"
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded"
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field"
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error"
    });
  }

  next();
};

export default upload;


