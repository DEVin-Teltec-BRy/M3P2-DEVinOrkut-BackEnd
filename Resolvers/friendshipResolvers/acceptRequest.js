const { UserInputError } = require('apollo-server');

const acceptRequest = async (
    _,
    { loggedUserId, acceptFriendshipId },
    { dataSources: { users }, userId },
) => {
    const loggedUser = await users.getUser(userId);
    if (!loggedUser) {
        throw new UserInputError('Você precisa estar logado para fazer isso');
    }
    if (loggedUserId !== userId) {
        throw new UserInputError(
            'O usuário que esta tentando aceitar a solicitação de amizade não é o mesmo que está logado',
        );
    }
    const index = loggedUser.friendRequest.findIndex(
        requestedId => requestedId.toString() === acceptFriendshipId,
    );
    if (index === -1) {
        throw new UserInputError(
            'Você está tentando aceitar uma solicitação de amizade que não existe',
        );
    }
    const userAcceptFriend = await users.getUser(acceptFriendshipId)
    if(!userAcceptFriend) {
        throw new UserInputError('Usuário que enviou a solicitação não existe.')
    }
    const alreadyFriend = loggedUser.friends.find((friendId) => friendId.toString() === acceptFriendshipId);
    if(alreadyFriend) {
        throw new UserInputError('Você já é amigo deste usuário');
    }
    userAcceptFriend.friends.push(loggedUser._id);
    loggedUser.friends.push(acceptFriendshipId);
    loggedUser.friendRequest.splice(index, 1);
    await loggedUser.save();
    return loggedUser.friendRequest;
};

module.exports = acceptRequest;
