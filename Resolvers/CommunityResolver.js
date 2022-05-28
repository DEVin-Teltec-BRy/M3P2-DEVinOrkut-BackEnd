const { Community } = require('../Db');
const { DateScalar } = require('./Scalar');
var validator = require('validator');

const communityResolvers = {
    Date: DateScalar,

    Query: {
        communities: async () => Community.find(),
    },

    Mutation: {
        createCommunity: async (
            _,
            { input },
            { dataSources: { communities, userId } },
        ) => {
            try {
                // if (!userId) {
                //     throw new Error(
                //         'Você precisa estar logado para criar uma comunidade.',
                //     );
                // }

                const isEmptyString = await validator.isEmpty(input.name, {
                    ignore_whitespace: false,
                });

                if (isEmptyString) {
                    throw new Error('Nome não pode ser vazio.');
                }

                const newCommunity = await communities.create({
                    name: input.name.trim(),
                    logo: input.logo,
                    description: input.description,
                    category: input.category,
                });
                return newCommunity;
            } catch (err) {
                throw new Error(`Algo deu errado: ${err.message}`);
            }
        },
    },
};

module.exports = communityResolvers;
