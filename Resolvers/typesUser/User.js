const UserTypes = {
    friends: async (user, _, { dataSources: { users } }) => {
        return user.friends.map(idFriend => users.getUser(idFriend));
    },
    friendRequest: async (user, _, { dataSources: { users } }) => {
        return user.friendRequest.map(idRequestedFriend =>
            users.getUser(idRequestedFriend),
        );
    },
    communities: async (parent, _, { dataSources: { communities } }) => {
        return parent.communities.map(communityId =>
            communities.getCommunityById(communityId),
        );
    },
};

module.exports = UserTypes;
