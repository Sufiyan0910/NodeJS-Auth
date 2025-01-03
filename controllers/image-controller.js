const Image = require("../models/image");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");

const uploadImageController = async (req, res) => {
  try {
    // Check if file is missing in req object
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File Is required. Please upload an image.",
      });
    }

    // Upload image to cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.path);

    // Store the image url and publicId along with the uploaded user id in the database
    const newlyUploadedImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId,
    });

    await newlyUploadedImage.save();

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: newlyUploadedImage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again later",
    });
  }
};

module.exports = { uploadImageController };
