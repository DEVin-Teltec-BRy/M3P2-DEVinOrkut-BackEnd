const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    fullName: String,
    cpf: String,
    email: String,
    birthDate: String,
    gender: String,
    postal: String,
    city: String,
    state: String,
    address: String,
    number: Number,
    complement: String,
    district: String,
    reference: String,
    relationship: String,
    humor: [String],
    interests: [String],
    aboutMe: String,
    password: String,
    scraps: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Scrap',
        },
    ],
    testimonial: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Testimonial',
        },
    ],
    trusty: [String],
    cool: [String],
    sexy: [String],
    fans: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    imageUrl: [String],
    profilePicture: [String],
    friends: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Friends',
            required: false,
        },
    ],
    friendRequest: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Friends',
            required: false,
        },
    ],
    communities: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Communities',
            required: false,
        },
    ],
    createAt: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
