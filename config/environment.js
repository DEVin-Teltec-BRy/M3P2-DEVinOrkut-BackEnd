require('dotenv').config();

module.exports = {
    dbURL: process.env.URI,
    port: process.env.PORT || 4000,
    jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'secret',
    jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'secret',
};
