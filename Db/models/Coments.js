const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ComentsSchema = mongoose.Schema({
    
    description: {
        type: String,
        unique: true,
        required: true,
    },
    creation_date: {
        type: Date,
        default: Date.now(),
    },
    author: 
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
    forum: 
        {
            type: Schema.Types.ObjectId,
            ref: 'Forum',
            required: false,
        },    
});

module.exports = mongoose.model('Coments', ComentsSchema);
