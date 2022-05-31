const User = require('../Db/models/user');
const fs = require('fs');

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

module.exports = {
    uploads,
};
