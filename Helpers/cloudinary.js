const cloudinaryModule = require('cloudinary');
const enviroment = require('../Config/Environment');

const cloudinary = cloudinaryModule.v2;

cloudinary.config({
    cloud_name: enviroment.cloudinary_name,
    api_key: enviroment.cloudinary_api_key,
    api_secret: enviroment.cloudinary_api_secret,
});

module.exports = cloudinary;
