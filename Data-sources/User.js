const { MongoDataSource } = require('apollo-datasource-mongodb');

class Users extends MongoDataSource {
    getUser(userId) {
        return this.findOneById(userId);
    }
    getAll() {
        return this.model.find();
    }
    create(user) {
        return this.model.create(user);
    }
    findByEmail(email) {
        return this.findByFields({ email });
    }
    searchUserByName(name){
        return this.model.find({fullName: {$regex:name, $options: "i"}});
    }
}

module.exports = Users;
