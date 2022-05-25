// resolvers
const userResolvers = {
  Query: {
    users: async (_, __, { dataSources: { users } }) => users.getAll(),
  },
};

module.exports = userResolvers;
