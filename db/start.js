const mongoose = require('mongoose');
const { dbURL } = require('../config/environment');

const dbUri = dbURL;
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.connect(dbUri, dbOptions);

const db = mongoose.connection;

db.on('Error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('\u{1F3AF} Database connected');
});
