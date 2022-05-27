const { Community } = require('../Db');
const { DateScalar } = require('./Scalar');

const communityResolvers = {
    Date: DateScalar,

    Query: {
        communities: async () => Community.find(),
        community: async (_, { id }, { dataSources: { communities }, userId }) => communities.findOneById(id),
    },

    Mutation: {
        createCommunity: async (
            _,
            { input },
            { dataSources: { communities } },
        ) => {
            try {
                const newCommunity = await communities.create({
                    name: input.name,
                    description: input.description,
                    category: input.category,
                });
                return newCommunity;
            } catch (error) {
                console.log({ error });
                throw new Error('Erro ao criar comunidade.');
            }
        },
    },
    Community: {
        members: async (communityArg, { limit, offset }, { dataSources: { users }, userId }, info) => {
            const newLimit = !Number(limit) || Number(limit) > 20 ? 20 : Number(limit);
            const newOffset = !Number(offset) ? 0 : Number(offset);
            console.log(newOffset, newLimit)
            try {

                // A modificação da variavel userId(inserindo ID de algum membro da comunidade) 
                // deve ser feita para efeito de testes, pois a feature de login
                // não foi implementada no projeto. Excluir esse comentário quando a feature de login for implementada. 
                userId = '62915a0f5e0e3f1b54c8cd02';
                if (!userId) {
                    return [];
                }
                const memberOrNot = await communityArg.members.find(member => member.toString() === userId.toString());
                if (memberOrNot) {
                    const data = await users.findManyByIds(communityArg.members)
                    const response = await data.slice(newOffset, newOffset + newLimit).reverse();
                    return response;
                } else {
                    return [];
                }
            } catch (error) {
                return error.message;
            }
        },
    }
};

module.exports = communityResolvers;
