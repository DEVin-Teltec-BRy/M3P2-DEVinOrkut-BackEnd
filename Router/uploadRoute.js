const express = require('express');
const store = require('../Helpers/multer');
const auth = require('../Helpers/auth');
const { uploads } = require('../Controllers/uploadController');
const route = express.Router();

route.post('/upload', auth, store.single('images'), uploads);

module.exports = route;
