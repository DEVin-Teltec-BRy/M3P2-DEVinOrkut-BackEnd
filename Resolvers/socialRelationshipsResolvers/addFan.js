const User = require('../../Db/models/user');
const { UserInputError } = require('apollo-server');

const fanRequest = async (
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
        if (!followed) {
            throw new UserInputError(
                'Você está tentando seguir um usuário que não existe.',
            );
        }

        if (followedId === userId) {
            throw new UserInputError('Você não pode seguir a si mesmo.');
        }

        const fan = await User.findOne({ _id: userId });
        if (!fan) {
            throw new UserInputError('Você não existe.');
        }

        const isFan = followed.fans.includes(userId);
        if (isFan) {
            throw new UserInputError('Você já segue este usuário.');
        }

        await User.findByIdAndUpdate(
            { _id: followedId },
            { $push: { fans: userId } },
        );

        return {
            id: userId,
        };
    } catch (error) {
        throw new UserInputError(error.message);
    }
};

module.exports = fanRequest;
