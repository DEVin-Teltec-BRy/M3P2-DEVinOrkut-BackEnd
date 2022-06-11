const User = require('../../Db/models/user');

const removeFanRequest = async (
    _,
    { followedId },
    { dataSources: { users }, userId },
) => {
    try {
        const loggedIn = await users.getUser(userId);
        if (!loggedIn) {
            throw new UserInputError('Você precisa estar logado.');
        }

        const followed = await users.getUser(followedId);

        if (followed == null || followed == undefined) {
            throw new UserInputError('Usuário não existe.');
        }

        if (followedId === userId) {
            throw new UserInputError('Você não pode seguir a si mesmo.');
        }

        const fan = await User.findOne({ _id: userId });
        if (!fan) {
            throw new UserInputError('Você não existe.');
        }

        const isFan = followed.fans.includes(userId);
        if (!isFan) {
            throw new UserInputError('Você não segue este usuário.');
        }

        await User.findByIdAndUpdate(
            { _id: followedId },
            { $pull: { fans: userId } },
        );

        return {
            id: userId,
        };
    } catch (error) {
        throw new UserInputError(error.message);
    }
};

module.exports = removeFanRequest;
