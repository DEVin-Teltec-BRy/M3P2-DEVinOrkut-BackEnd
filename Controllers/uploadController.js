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

        // const imgArray = files.map(file => {
        //     const img = fs.readFileSync(file.path);

        //     return (encode_image = img.toString('base64'));
        // });

        // const result = imgArray.map((src, index) => {
        //     const finalImg = {
        //         filename: files[index].originalname,
        //         contentType: files[index].mimetype,
        //         imageBase64: src,
        //         user: userId,
        //     };

        //     return finalImg;
        // });

        //const newUpload = new Upload(final_img);

        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { profilePicture: finalImg } },
        );

        // const session = await mongoose.startSession();
        // session.startTransaction();
        // await newUpload.save({ session: session });
        // user.profilePicture.push(newUpload);
        // await user.save({ session: session });
        // await session.commitTransaction();

        res.status(201).send(`Uploaded Successfully...!`);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
};

module.exports = {
    uploads,
};
