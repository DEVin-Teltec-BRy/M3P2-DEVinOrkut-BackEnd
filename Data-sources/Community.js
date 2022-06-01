const { MongoDataSource } = require('apollo-datasource-mongodb');

class Community extends MongoDataSource {
    create(community) {
        return this.model.create(community);
    }
    getAll() {
        return this.model.find();
    }
    joinCommunity(communityId) {
        return this.model.findByIdAndUpdate(communityId);
    }
    searchCommunityByName(name) {
        return this.model.find({ name: { $regex: name, $options: 'i' } });
    }
    getCommunityByIt(communityId) {
        return this.model.findById(communityId);
    }
}

module.exports = Community;
