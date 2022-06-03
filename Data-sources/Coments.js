const { MongoDataSource } = require('apollo-datasource-mongodb');

class Coment extends MongoDataSource {
    create(coments) {
        return this.model.create(coments);
    }
    findManyByIds(ids) {
        return this.findManyByIds(ids);
    }
}

module.exports = Coment;