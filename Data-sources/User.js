const { MongoDataSource } = require('apollo-datasource-mongodb');
const { generatePagination } = require('../Helpers/functions');

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
    async getFriends(idUser, pageNumber = 1, nPerPage = 20) {
        const user = await this.findOneById(idUser);
        const count = user.friends.length;
        let nextPage;
        let prevPage;
        let totalPages;
        const currentPage = pageNumber;
        const listFriends = user.friends;
        let dataFriends = []

        if (count > 0) {
             dataFriends = await Promise.all(listFriends.map(async friend => {
                const { id, fullName, profilePicture } =
                    await await this.findOneById(friend);
                return {
                    id,
                    fullName,
                    profilePicture,
                };
            }))
        }
        const friends = generatePagination(dataFriends, nPerPage, pageNumber);

        if (!(Math.floor(count / nPerPage) == 0)) {
            totalPages = Math.ceil(count / nPerPage);
            nextPage = pageNumber + 1;
        }
        totalPages = count <= 0 ? null : totalPages;
        nextPage =
            friends.length == 0 || totalPages < nextPage ? null : nextPage;
        prevPage = pageNumber != 1 ? pageNumber - 1 : null;

        return {
            results: friends,
            pagination: {
                count,
                currentPage,
                totalPages,
                nextPage,
                totalPages,
                prevPage,
            }
         
        };
    findByCpf(cpf) {
        return this.model.findByFields({ cpf });
    }
    searchUserByName(name) {
        return this.model.find({ fullName: { $regex: name, $options: 'i' } });
    }
}

module.exports = Users;
