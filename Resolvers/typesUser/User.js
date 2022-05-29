const UserTypes = {
    friends: async (user, _, { dataSources: { users } }) => {
        return user.friends.map(idFriend => users.getUser(idFriend));
    },
    friendRequest: async (user, _, { dataSources: { users } }) => {
        return user.friendRequest.map(idRequestedFriend => users.getUser(idRequestedFriend));
    }
};
module.exports = UserTypes