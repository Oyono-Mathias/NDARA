import multer from "multer";
import path from "path";

// 1. Defining Max Sizes (in bytes)
const MAX_SIZES = {
  avatar: 5 * 1024 * 1024,    // 5MB
  image:   10 * 1024 * 1024, // 10MB
  kyc:     15 * 1024 * 1024, // 15MB
  backup:  100 * 1024 * 1024 // 100MB
};

// 2. Defining Allowed Mimetypes & Extensions
const ALLOWED_MIME_TYPES = {
  images: ["image/jpeg", "image/png", "image/webp"],
  documents: ["application/pdf", "image/jpeg", "image/png"],
  backups: ["application/zip", "application/gzip", "application/json"]
};

// Map route/context to allowed type lists
function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback, context: string) {
  let allowedMimes: string[] = [];

  switch (context) {
    case "users/avatars":
    case "forums/images":
    case "ads/photos":
      allowedMimes = ALLOWED_MIME_TYPES.images;
      break;
    case "documents/kyc":
      allowedMimes = ALLOWED_MIME_TYPES.documents;
      break;
    case "courses/materials":
      allowedMimes = ["application/pdf"];
      break;
    case "exports/backups":
      allowedMimes = ALLOWED_MIME_TYPES.backups;
      break;
    default:
      return cb(new Error(`Validation Error: Unknown upload context '${context}'`));
  }

  // Prevent dangerous extensions even if mime is bypassed
  const ext = path.extname(file.originalname).toLowerCase();
  const dangerousExts = [".exe", ".sh", ".bat", ".php", ".js", ".html", ".svg"];
  if (dangerousExts.includes(ext)) {
    return cb(new Error("Validation Error: Dangerous file extension rejected."));
  }

  if (allowedMimes.includes(file.mimetype)) {
    return cb(null, true);
  } else {
    return cb(new Error(`Validation Error: MIME type '${file.mimetype}' is not allowed for this folder.`));
  }
}

// Global memory storage
const storage = multer.memoryStorage();

// Export Multer instances for different contexts
export const uploadAvatar = multer({
  storage,
  limits: { fileSize: MAX_SIZES.avatar },
  fileFilter: (req, file, cb) => checkFileType(file, cb, "users/avatars")
});

export const uploadForumImage = multer({
  storage,
  limits: { fileSize: MAX_SIZES.image },
  fileFilter: (req, file, cb) => checkFileType(file, cb, "forums/images")
});

export const uploadAdsPhoto = multer({
  storage,
  limits: { fileSize: MAX_SIZES.image },
  fileFilter: (req, file, cb) => checkFileType(file, cb, "ads/photos")
});

export const uploadKycDoc = multer({
  storage,
  limits: { fileSize: MAX_SIZES.kyc },
  fileFilter: (req, file, cb) => checkFileType(file, cb, "documents/kyc")
});

export const uploadCourseMaterial = multer({
  storage,
  limits: { fileSize: MAX_SIZES.kyc }, // PDF sizes similar to KYC
  fileFilter: (req, file, cb) => checkFileType(file, cb, "courses/materials")
});

export const uploadBackup = multer({
  storage,
  limits: { fileSize: MAX_SIZES.backup },
  fileFilter: (req, file, cb) => checkFileType(file, cb, "exports/backups")
});
