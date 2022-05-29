const { MongoDataSource } = require('apollo-datasource-mongodb');

class Community extends MongoDataSource {
    create(community) {
        return this.model.create(community);
    }
    getAll() {
        return this.model.find();
    }
    searchCommunityByName(name){
        return this.model.find({name: {$regex:name, $options: "i"}});
    }
}

module.exports = Community;
