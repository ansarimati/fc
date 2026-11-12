const multer = require("multer");

const storage = multer.memoryStorage();

export const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fieldSize: 5 * 1024 * 1024 , files: 8 } // 5 MB per file and 8 files max
});

export default upload;