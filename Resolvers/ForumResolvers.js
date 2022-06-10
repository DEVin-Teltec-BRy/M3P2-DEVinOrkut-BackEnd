const { DateScalar } = require('./Scalar');

const forumResolvers = {
    Date: DateScalar,

    Query: {
        forum: async (_, { id }, { dataSources: { foruns }, userId }) => {
            try {
                if (!userId)
                    throw new AuthenticationError('you must be logged in');

                return foruns.findOneById(id);
            } catch (error) {
                throw new Error(error);
            }
        },
    },

    Mutation: {
        createForum: async (
            _,
            { input },
            { dataSources: { foruns, communities, users }, userId },
        ) => {
            try {
                if (!userId) {
                    throw new Error(
                        'Você precisa estar logado para criar um fórum.',
                    );
                }

                const findCommunity = await communities.getCommunityById(
                    input.community,
                );
                if (!findCommunity)
                    throw new Error('Comunidade não encontrada.');

                const isMemberCommunity =
                    findCommunity.members.includes(userId);

                if (!isMemberCommunity)
                    throw new Error(
                        'Para criar um fórum você deve ser membro da comunidade.',
                    );

                const user = await users.getUser(userId);

                const newForum = await foruns.create({
                    name: input.name.trim(),
                    logo: input.logo,
                    category: input.category,
                    description: input.description,
                    community: input.community,
                    owner: user,
                    members: [user],
                });

                await communities.updateCommunity(
                    { _id: input.community },
                    { $push: { foruns: newForum._id } },
                );

                return newForum;
            } catch (error) {
                throw new Error(error);
            }
        },
    },
    Forum: {
        comments: async (
            forumArg,
            { limit, offset },
            { dataSources: { coments, users }, userId },
            info,
        ) => {
            const newLimit =
                !Number(limit) || Number(limit) > 50 ? 50 : Number(limit);
            const newOffset = !Number(offset) ? 0 : Number(offset);
            try {
                if (!userId) {
                    throw new Error(
                        'Você precisa estar logado para visualizar a comunidade.',
                    );
                }
                const forumComments = await coments.findManyByIds(
                    forumArg.coments,
                );
                const authors = await users.findManyByIds(
                    forumComments.map(comment => comment.author),
                );
                const data = await forumComments.map(comment => {
                    return {
                        ...comment['_doc'],
                        author: authors.find(
                            author => author.id == comment.author,
                        ),
                        id: comment['_id'],
                    };
                });
                return await data
                    .slice(newOffset, newOffset + newLimit)
                    .reverse();
            } catch (error) {
                throw new Error(error);
            }
        },
        owner: async (
            forumArg,
            { limit, offset },
            { dataSources: { users }, userId },
            info,
        ) => {
            try {
                if (!userId) {
                    throw new Error('Você precisa estar logado para visualizar o fórum.');
                }
                return await users.findOneById(forumArg.owner);
            } catch (error) {
                return error.message;
            }
        }
    },
};

module.exports = forumResolvers;

const { MongoClient } = require('mongodb');
