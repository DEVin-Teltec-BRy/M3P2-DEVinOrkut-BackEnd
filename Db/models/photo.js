const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AlbumSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    albumName: String,
    description: String,
    images: [Buffer],
    createAt: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Album', AlbumSchema);
