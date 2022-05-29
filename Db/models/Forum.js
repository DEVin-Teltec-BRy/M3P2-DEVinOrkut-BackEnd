const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ForumSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    logo: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: [
            'BEM_ESTAR',
            'DIVERSOS',
            'ESPORTES',
            'FAMOSOS',
            'FILMES',
            'GASTRONOMIA',
            'JOGOS',
            'MUSICA',
            'NATUREZA',
            'TECNOLOGIA',
        ],
        default: 'DIVERSOS',
        required: true,
    },
    description: {
        type: String,
        unique: true,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
    ],
    creation_date: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('Forum', ForumSchema);
