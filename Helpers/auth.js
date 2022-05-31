const jwt = require('jsonwebtoken');
const environment = require('../Config/Environment');

function auth(req, res, next) {
    const { authorization } = req.headers;

    const token = authorization.replace('Bearer ', '');
    console.log(token);

    if (!token) return res.status(401).send('Not authorized...');

    try {
        const secretKey = environment.jwtAccessTokenSecret;
        const payload = jwt.verify(token, secretKey);
        req.user = payload;
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
}

module.exports = auth;
