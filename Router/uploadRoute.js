const express = require('express');
const store = require('../Helpers/multer');
const auth = require('../Helpers/auth');
const {
    uploads,
    uploadImageUser,
    uploadImageCommunity,
} = require('../Controllers/uploadController');
const route = express.Router();

route.post('/upload', auth, store.single('images'), uploads);
route.post('/upload/user', auth, uploadImageUser);
route.post('/upload/community/:communityId', auth, uploadImageCommunity);

module.exports = route;
