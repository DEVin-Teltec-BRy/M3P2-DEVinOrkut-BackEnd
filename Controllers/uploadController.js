const UploadModel = require('../Db/models/upload');
const fs = require('fs');

const uploads = (req, res) => {
    const files = req.files;
    console.log(files);

    if (!files) {
        res.status(400).send('Please choose file');
    }

    let imgArray = files.map(file => {
        let img = fs.readFileSync(file.path);

        return (encode_image = img.toString('base64'));
    });

    let result = imgArray.map((src, index) => {
        let finalImg = {
            filename: files[index].originalname,
            contentType: files[index].mimetype,
            imageBase64: src,
        };

        let newUpload = new UploadModel(finalImg);

        return newUpload
            .save()
            .then(() => {
                return {
                    msg: `${files[index].originalname} Uploaded Successfully...!`,
                };
            })
            .catch(error => {
                if (error) {
                    if (error.name === 'MongoError' && error.code === 11000) {
                        return Promise.reject({
                            error: `Duplicate ${files[index].originalname}. File Already exists! `,
                        });
                    }
                    return Promise.reject({
                        error:
                            error.message ||
                            `Cannot Upload ${files[index].originalname} Something Missing!`,
                    });
                }
            });
    });

    Promise.all(result)
        .then(msg => {
            res.json(msg);
        })
        .catch(err => {
            res.json(err);
        });
};

module.exports = {
    uploads,
};
