const multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        var ext = file.originalname.substring(
            file.originalname.lastIndexOf('.'),
        );
        cb(null, file.fieldname + '-' + Date.now() + ext);
    },
});

module.exports = store = multer({ storage: storage });
