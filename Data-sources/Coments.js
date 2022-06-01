const { MongoDataSource } = require('apollo-datasource-mongodb');

class Forum extends MongoDataSource {
    create(coments) {
        return this.model.create(coments);
    }
}

module.exports = Forum;