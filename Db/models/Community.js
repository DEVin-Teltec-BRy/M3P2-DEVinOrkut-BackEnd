const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommunitySchema = mongoose.Schema({
    name: String,
    description: String,
    category: String,
    creation_date: {
        type: Date,
        default: Date.now(),
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
    ],
});

module.exports = mongoose.model('Community', CommunitySchema);
