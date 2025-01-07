const Image = require("../models/image");
const { uploadToCloudinary } = require('../helper/cloudinaryHelper');
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

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


    // Delete the file from the local storage
    // fs.unlinkSync(req.file.path);


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

const fetchImagesController = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'asc' ? 1 : -1;
    const totalImages = await Image.countDocuments();
    const totalPages = Math.ceil(totalImages / limit);

    const sortObj = {};
    sortObj[sortBy] = sortOrder;
    const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

    if (images) {
      res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: totalPages,
        totalImages: totalImages,
        data: images,
      });
    }
  }
  catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again later",
    });
  }
}

// Delete Image
const deleteImageController = async (req, res) => {
  try {
    const getCurrentIdOfImageToBeDeleted = req.params.id;
    const userId = req.userInfo.userId;

    const image = await Image.findById(getCurrentIdOfImageToBeDeleted);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // check if this image is uploaded by the current user who is trying to delete this image
    if (image.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this image because you haven`t uploaded it'
      })
    }

    // Delete this image first from your cloudinay account
    await cloudinary.uploader.destroy(image.publicId);

    // Delete this image from mongobd database
    await Image.findByIdAndUpdate(getCurrentIdOfImageToBeDeleted);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error Occured! Please try again.",
    });
  }
}

module.exports = { uploadImageController, fetchImagesController, deleteImageController };
