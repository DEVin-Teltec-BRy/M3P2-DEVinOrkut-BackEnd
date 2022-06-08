const { MongoDataSource } = require('apollo-datasource-mongodb');

class Category extends MongoDataSource {
    getAll() {
        return this.model.find();
    }
}

module.exports = Category;
