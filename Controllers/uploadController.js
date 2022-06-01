const User = require('../Db/models/user');
const fs = require('fs');
const cloudinary = require('../Helpers/cloudinary');

// controller do endpoint para salvar imagens diretamente no mongoDB em base64
const uploads = async (req, res) => {
    try {
        const userId = req.user.userId;
        const img = fs.readFileSync(req.file.path);

        const encode_img = img.toString('base64');

        if (!img) {
            res.status(400).send('Please choose file');
        }

        const finalImg = {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            imageBase64: Buffer.from(encode_img, 'base64'),
        };

        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { profilePicture: finalImg } },
        );

        res.status(201).send(`Uploaded Successfully...!`);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
};

// controller de endpoint para salvar imagens na cloud do Cloudinary
const uploadImageUser = async (req, res) => {
    const { image } = req.body;
    const userId = req.user.userId;

    try {
        const uploadedResponse = await cloudinary.uploader.upload(image, {
            upload_preset: 'devinorkut',
        });
        const url = uploadedResponse.url;

        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { imageUrl: url } },
        );

        res.status(201).send(`Uploaded Successfully...!`);
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

module.exports = {
    uploads,
    uploadImageUser,
};
