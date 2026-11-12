const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../middleware/asyncHandler");

/** Helper: upload a single buffer to Cloudinary */
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// ─── @desc Upload product images ─────────────────────────────
// @route POST /api/upload/products
export const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400)
    throw new Error("Please upload at least one image");
  }

  const uploadPromises = req.files.map((file) => {
    uploadBufferToCloudinary(file.buffer, "techbazaar/products");
  });

  const urls = await Promise.all(uploadPromises);

  res.status(201).json({
    success: true,
    message: `${urls.length} image(s) uploaded successfully`,
    data: { urls },
  });
});

// ─── @desc Upload single avatar image ────────────────────────
// @route POST /api/upload/avatar
export const uploadAvatar = asyncHandler(async(req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload an image");
  }

  const url = await uploadBufferToCloudinary(req.file.buffer, "techbazaar/avatars");
  res.status(201).json({
    success: true,
    message: "Avatar uploaded successfully",
    data: { url },
  });
});

