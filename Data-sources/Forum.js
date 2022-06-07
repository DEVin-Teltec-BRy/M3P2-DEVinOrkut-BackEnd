const { MongoDataSource } = require('apollo-datasource-mongodb');

class Forum extends MongoDataSource {
    create(forum) {
        return this.model.create(forum);
    }
    findOneById(id) {
        return this.model.findById(id);
    }
    findManyByIds(ids) {
        return this.findManyByIds(ids);
    }
}

module.exports = Forum;
