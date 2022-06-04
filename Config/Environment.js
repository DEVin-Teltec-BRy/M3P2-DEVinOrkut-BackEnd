require('dotenv').config();

module.exports = {
    dbURL: process.env.URI,
    port: process.env.PORT || 4000,
    jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'secret',
    jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'secret',
    cloudinary_name: process.env.CLOUDINARY_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
    configEmail: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    },
};
