const { UserInputError } = require('apollo-server');

const declineFriendship = async (
    _,
    { loggedUserId, declineFriendshipId },
    { dataSources: { users }, userId },
) => {
    const loggedUser = await users.getUser(userId);
    if (!loggedUser) {
        throw new UserInputError('Você precisa estar logado para fazer isso');
    }
    console.log(loggedUserId);
    console.log(userId)
    if (loggedUserId !== userId) {
        throw new UserInputError(
            'O usuário que esta tentando recusar a solicitação de amizade não é o mesmo que está logado',
        );
    }
    const index = loggedUser.friendRequest.findIndex(
        requestedId => requestedId.toString() === declineFriendshipId,
    );
    if (index === -1) {
        throw new UserInputError(
            'Você está tentando recusar uma solicitação de amizade que não existe',
        );
    }
    loggedUser.friendRequest.splice(index, 1);
    return loggedUser.save();
};

module.exports = declineFriendship;
