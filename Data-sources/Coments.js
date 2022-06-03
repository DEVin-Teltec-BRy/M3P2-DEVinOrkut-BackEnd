const { MongoDataSource } = require('apollo-datasource-mongodb');

class Coment extends MongoDataSource {
    create(coments) {
        return this.model.create(coments);
    }
    delete(comentId) {
        return this.model.deleteOne(comentId);
    }
    getComent(comentId) {
        return this.findOneById(comentId);
    }
}

module.exports = Coment;