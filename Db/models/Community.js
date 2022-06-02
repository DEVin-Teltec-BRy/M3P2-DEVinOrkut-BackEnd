const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommunitySchema = mongoose.Schema({
    logo: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
        unique: true,
        required: true,
    },
    imageUrl: [String],
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
    },
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
    foruns: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Forum',
            required: false,
        },
    ],
});

module.exports = mongoose.model('Community', CommunitySchema);
