'use strict';

const express = require('express');
const { upload } = require('../Helpers/imageUpload');
const { singleFileUpload } = require('../Controllers/uploadController');
const router = express.Router();

router.post('/singlefile', upload.single('file'), singleFileUpload);

module.exports = {
    routes: router,
};
