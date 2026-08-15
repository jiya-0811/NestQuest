const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

require("dotenv").config();

console.log("========== CLOUDINARY TEST ==========");
console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API KEY:", process.env.CLOUDINARY_KEY ? "FOUND" : "MISSING");
console.log("API SECRET:", process.env.CLOUDINARY_SECRET ? "FOUND" : "MISSING");
console.log("=====================================");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nestquest",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

module.exports = {
  cloudinary,
  storage
};