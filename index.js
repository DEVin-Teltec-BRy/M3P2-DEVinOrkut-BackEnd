const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const path = require('path');

const { importSchema } = require('graphql-import');
const { port } = require('./Config/Environment');
const resolvers = require('./Resolvers');

const db = require('./Db');
require('./Db/start');

const Users = require('./Data-sources/User');
const Communities = require('./Data-sources/Community');

const { getUserId } = require('./Helpers/functions');

const schemaPath = './schemas/index.graphql';
const app = express();
const server = new ApolloServer({
    typeDefs: importSchema(schemaPath),
    resolvers,
    playground: true,
    tracing: true,
    context: ({ req }) => {
        return {
            db,
            userId: req && req.headers.authorization ? getUserId(req) : null,
        };
    },
    dataSources: () => ({
        users: new Users(db.User),
        communities: new Communities(db.Community),
    }),
});
(async () => {
    await server.start()
    server.applyMiddleware({ app });
})();
app.get('/', (req, res) => {
    res.redirect('/graphql');
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`\u{1F680} Server running on ${port}`);
});
