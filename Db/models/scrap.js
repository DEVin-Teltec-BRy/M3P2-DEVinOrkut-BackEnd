const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScrapSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    name: String,
    scrap: String,
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Scrap', ScrapSchema);
