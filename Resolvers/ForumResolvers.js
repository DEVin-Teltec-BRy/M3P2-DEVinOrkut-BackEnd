const { Forum, Community } = require('../Db');
const { DateScalar } = require('./Scalar');
var validator = require('validator');

const forumResolvers = {
    Date: DateScalar,

    Query: {},

    Mutation: {
        createForum: async (
            _,
            { input },
            { dataSources: { foruns }, userId },
        ) => {
            try {
                if (!userId) {
                    throw new Error(
                        'Você precisa estar logado para criar um fórum.',
                    );
                }

                const findCommunity = await Community.findById(input.community);
                if (!findCommunity)
                    throw new Error('Comunidade não encontrada.');

                const isMemberCommunity =
                    findCommunity.members.includes(userId);

                if (!isMemberCommunity)
                    throw new Error(
                        'Para criar um fórum você deve ser membro da comunidade.',
                    );

                const newForum = await foruns.create({
                    name: input.name.trim(),
                    logo: input.logo,
                    category: input.category,
                    description: input.description,
                    community: input.community,
                    owner: userId,
                });

                await Community.findOneAndUpdate(
                    { _id: input.community },
                    { $push: { foruns: newForum._id } },
                );

                await Forum.findOneAndUpdate(
                    { _id: newForum._id },
                    { $push: { members: userId } },
                );

                return newForum;
            } catch (error) {
                throw new Error(error);
            }
        },
    },
};

module.exports = forumResolvers;

const { MongoClient } = require('mongodb');
