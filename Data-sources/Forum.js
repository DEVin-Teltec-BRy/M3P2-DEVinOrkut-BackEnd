const { MongoDataSource } = require('apollo-datasource-mongodb');

class Forum extends MongoDataSource {
    create(forum) {
        return this.model.create(forum);
    }
    findOneById(id) {
        return this.model.findById(id);
    }
}

module.exports = Forum;
