const categoryResolvers = {
    Query: {
        categories: async (_, __, { dataSources: { categories } }) => {
            return categories.getAll();
        },
    },
};

module.exports = categoryResolvers;
