// aqui vamos chamar os resolvers. Exemplo: const resolvers = [User, Community, Friends]
// cada squad pode criar um arquivo pra resolver na pasta resolvers. Exemplo: FriendsResolvers.js
const User = require('./UserResolvers');
const Category = require('./CategoryResolver');
const Community = require('./CommunityResolver');
const Forum = require('./ForumResolvers');
const Coment = require('./ComentResolver');

const resolvers = [User, Community, Forum, Coment, Category];

module.exports = resolvers;
