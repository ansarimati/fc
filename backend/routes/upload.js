const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/auth");
const { uploadProductImages, uploadAvatar } = require("../controllers/uploadController");

router.post("/product", protect, adminOnly, upload.array("images", 8), uploadProductImages);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

export default router;
