const { MongoDataSource } = require('apollo-datasource-mongodb');

class Community extends MongoDataSource {
    create(community) {
        return this.model.create(community);
    }
    getAll() {
        return this.model.find();
    }
}

module.exports = Community;
