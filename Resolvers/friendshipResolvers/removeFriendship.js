const { UserInputError } = require('apollo-server');

const removeFriendship = async (
    _,
    { loggedUserId, removeFriendshipId },
    { dataSources: { users }, userId },
) => {
    const loggedUser = await users.getUser(userId);
    if (!loggedUser) {
        throw new UserInputError('Você precisa estar logado para fazer isso');
    }
    if (loggedUserId !== userId) {
        throw new UserInputError(
            'O usuário que esta tentando recusar a solicitação de amizade não é o mesmo que está logado',
        );
    }
    const index = loggedUser.friends.findIndex(
        requestedId => requestedId.toString() === removeFriendshipId,
    );
    if (index === -1) {
        throw new UserInputError(
            'Você está tentando desfazer uma amizade que não existe',
        );
    }
    const friend = await users.getUser(loggedUser.friends[index]);
    const loggedIndex = friend.friends.findIndex(friend => friend.toString() === loggedUser._id.toString());
    loggedUser.friends.splice(index, 1);
    friend.friends.splice(loggedIndex, 1);
    await friend.save();
    await loggedUser.save();
    return loggedUser;
};

module.exports = removeFriendship;
