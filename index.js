const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const path = require('path');

const { importSchema } = require('graphql-import');
const { port } = require('./config/environment');
const resolvers = require('./resolvers');

const db = require('./db');
require('./db/start');

const Users = require('./data-sources/user');
const { getUserId } = require('./helpers/functions');

const schemaPath = './schemas/index.graphql';

const startApolloServer = async () => {
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
        })
    });
    await server.start();
    
    server.applyMiddleware({ app });
    
    app.use(express.static(path.join(__dirname, 'public')));

    await new Promise(resolve => app.listen({ port }, resolve));

    console.log(`\u{1F680} Server ready at http://localhost:${port}${server.graphqlPath}`);
    return { server, app };
};

startApolloServer();
