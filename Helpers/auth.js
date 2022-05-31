const jwt = require('jsonwebtoken');
const environment = require('../Config/Environment');

function auth(req, res, next) {
    try {
        const token = req.headers.authorization;

        if (!token) return res.status(401).send('Not authorized...');
        const secretKey = environment.jwtAccessTokenSecret;
        const payload = jwt.verify(token, secretKey);
        req.user = payload;
        next();
    } catch (error) {
        console.log(error);
        res.status(400).send('Invalid token');
    }
}

module.exports = auth;
