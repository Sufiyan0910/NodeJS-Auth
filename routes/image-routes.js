const express = require("express");
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const uploadMiddleware = require("../middleware/upload-middleware");
const { uploadImageController, fetchImagesController, deleteImageController } = require("../controllers/image-controller");

const router = express.Router();

// Upload the image
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single("image"),
  uploadImageController
);

// Get all images
router.get("/get", authMiddleware, fetchImagesController);

// Delete Image Route
// 677a19aa259fcea809a0c3e3
router.delete("/:id", authMiddleware, adminMiddleware, deleteImageController);
module.exports = router;
