const express = require('express');
const store = require('../Helpers/multer');
const { uploads } = require('../Controllers/uploadController');
const route = express.Router();

route.post('/upload', store.array('images', 12), uploads);

module.exports = route;
