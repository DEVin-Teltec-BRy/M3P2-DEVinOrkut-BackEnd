const { Community } = require('../Db');
const { DateScalar } = require('./Scalar');

const communityResolvers = {
    Date: DateScalar,

    Query: {
        communities: async () => Community.find(),
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
};

module.exports = communityResolvers;
