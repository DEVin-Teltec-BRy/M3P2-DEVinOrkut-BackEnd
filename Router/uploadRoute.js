const express = require('express');
const store = require('../Helpers/multer');
const auth = require('../Helpers/auth');
const { uploads, uploadImageUser } = require('../Controllers/uploadController');
const route = express.Router();

route.post('/upload', auth, store.single('images'), uploads);
route.post('/uploadImageUser', auth, uploadImageUser);

module.exports = route;
