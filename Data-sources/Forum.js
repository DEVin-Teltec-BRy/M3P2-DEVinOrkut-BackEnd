const { MongoDataSource } = require('apollo-datasource-mongodb');

class Forum extends MongoDataSource {
    create(forum) {
        return this.model.create(forum);
    }
}

module.exports = Forum;
