const singleFileUpload = async (req, res, next) => {
    try {
        const file = req.file;
        console.log(file);
        res.status(201).send('File Uploaded Successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
};

module.exports = {
    singleFileUpload,
};
