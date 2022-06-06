const { Community } = require('../Db');
const { DateScalar } = require('./Scalar');
var validator = require('validator');

const communityResolvers = {
    Date: DateScalar,

    Query: {
        communities: async () => Community.find(),
        community: async (
            _,
            { id },
            { dataSources: { communities }, userId },
        ) => {
            return communities.getCommunityById(id);
        },
    },

    Mutation: {
        createCommunity: async (
            _,
            { input },
            { dataSources: { communities, users }, userId },
        ) => {
            try {
                if (!userId) {
                    throw new Error(
                        'Você precisa estar logado para criar uma comunidade.',
                    );
                }

                const isEmptyString = await validator.isEmpty(input.name, {
                    ignore_whitespace: false,
                });

                if (isEmptyString) {
                    throw new Error('Nome não pode ser vazio.');
                }
                const user = await users.getUser(userId);
                const newCommunity = await communities.create({
                    name: input.name.trim(),
                    logo: input.logo,
                    description: input.description,
                    category: input.category,
                    owner: userId,
                    members: userId,
                });
                user.communities.push(newCommunity._id);
                await user.save();
                return newCommunity;
            } catch (err) {
                throw new Error(`Algo deu errado: ${err.message}`);
            }
        },
        joinCommunity: async (
            _,
            { community_id },
            { dataSources: { communities }, userId },
        ) => {
            try {
                if (!userId) {
                    throw new Error(
                        'Você precisa estar logado para entrar na comunidade.',
                    );
                }

                const community = await communities.getCommunityById(
                    community_id,
                );
                const hasMember = community.members.includes(userId);

                if (hasMember) {
                    throw new Error('Você já faz parte da comunidade.');
                }

                const newMember = await communities.updateCommunity(
                    { _id: community_id },
                    { $push: { members: userId } },
                );

                return newMember;
            } catch (error) {
                throw new Error(`${error.message}`);
            }
        },
        editCommunity: async (
            _,
            { community_id, input },
            { dataSources: { communities }, userId },
        ) => {
            try {
                if (!userId) {
                    throw new Error(
                        'Você precisa estar logado para visualizar a comunidade.',
                    );
                }

                const community = await communities.getCommunityById(
                    community_id,
                );
                const isOwner = community.owner == userId;

                if (!isOwner) {
                    return community;
                }

                const inputDatas = {
                    logo: input.logo,
                    name: input.name,
                    description: input.description,
                    category: input.category,
                };

                const updateCommunity = await communities.updateCommunity(
                    community_id,
                    inputDatas,
                );

                return updateCommunity;
            } catch (error) {
                throw new Error(`${error.message}`);
            }
        },
    },
    Community: {
        members: async (
            communityArg,
            { limit, offset },
            { dataSources: { users }, userId },
            info,
        ) => {
            const newLimit =
                !Number(limit) || Number(limit) > 20 ? 20 : Number(limit);
            const newOffset = !Number(offset) ? 0 : Number(offset);
            try {
                // A modificação da variavel userId(inserindo ID de algum membro da comunidade)
                // deve ser feita para efeito de testes, pois a feature de login
                // não foi implementada no projeto. Excluir esse comentário e alteração quando a feature de login for implementada.
                // userId = '628feb45cad8e4e007601c6x';
                if (!userId) {
                    return [];
                }
                const memberOrNot = await communityArg.members.find(
                    member => member.toString() === userId.toString(),
                );
                if (memberOrNot) {
                    const data = await users.findManyByIds(
                        communityArg.members,
                    );
                    return await data
                        .slice(newOffset, newOffset + newLimit)
                        .reverse();
                } else {
                    return [];
                }
            } catch (error) {
                return error.message;
            }
        },
        owner: async ({ owner }, _, { dataSources }) => {
            return dataSources.users.getUser(owner);
        },
    },
};

module.exports = communityResolvers;
