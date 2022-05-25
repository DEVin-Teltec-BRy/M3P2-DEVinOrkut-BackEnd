// aqui vamos chamar os resolvers. Exemplo: const resolvers = [User, Community, Friends]
// cada squad pode criar um arquivo pra resolver na pasta resolvers. Exemplo: FriendsResolvers.js
const User = require('./UserResolvers');

const resolvers = [User];

module.exports = resolvers;
