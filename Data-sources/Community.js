const { MongoDataSource } = require('apollo-datasource-mongodb');

class Community extends MongoDataSource {
    create(community) {
        return this.model.create(community);
    }
    getAll() {
        return this.model.find();
    }
    updateCommunity(communityId, data = null) {
        return this.model.findByIdAndUpdate(communityId, data);
    }
    searchCommunityByName(name) {
        return this.model.find({ name: { $regex: name, $options: 'i' } });
    }
    getCommunityById(communityId) {
        return this.model.findById(communityId);
    }
}

module.exports = Community;
