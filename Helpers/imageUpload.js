'use strict';

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(
            null,
            new Date().toISOString().replace(/:/g, '-') +
                '-' +
                file.originalname,
        );
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = { upload };

// fs.writeFile(__dirname + "/upload/out.png", base64Data, 'base64', function(err) {
//     if (err) console.log(err);
//     fs.readFile(__dirname + "/upload/out.png", function(err, data) {
//         if (err) throw err;
//         console.log('reading file...', data.toString('base64'));
//         res.send(data);
//     });
// });
