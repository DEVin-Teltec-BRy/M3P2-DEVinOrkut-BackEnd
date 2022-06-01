const { ApolloServer } = require('apollo-server-express');
const {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault,
} = require('apollo-server-core');
const express = require('express');
const cors = require('cors');
const path = require('path');

const { importSchema } = require('graphql-import');
const { port } = require('./Config/Environment');
const resolvers = require('./Resolvers');

const db = require('./Db');
require('./Db/start');


// const Users = require('./Data-sources/User');
// const Communities = require('./Data-sources/Community');
// const Foruns = require('./Data-sources/Forum');

const { Users, Communities, Foruns, Coment } = require('./Data-sources');


const { getUserId } = require('./Helpers/functions');

const schemaPath = './schemas/index.graphql';

(async function startApolloServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const server = new ApolloServer({
        typeDefs: importSchema(schemaPath),
        resolvers,
        playground: true,
        tracing: true,
        cors: {
            origin: '*',
            credentials: true,
        },
        context: ({ req }) => {
            return {
                userId:
                    req && req.headers.authorization ? getUserId(req) : null,
            };
        },
        dataSources: () => ({
            users: new Users(db.User),
            communities: new Communities(db.Community),
            foruns: new Foruns(db.Forum),
            coments: new Coment(db.Coment),
        }),
        plugins: [
            // Install a landing page plugin based on NODE_ENV
            process.env.NODE_ENV === 'production'
                ? ApolloServerPluginLandingPageProductionDefault({
                      graphRef: 'my-graph-id@my-graph-variant',
                      footer: false,
                  })
                : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
        ],
    });

    await server.start();

    server.applyMiddleware({ app });

    app.get('/', (req, res) => {
        res.redirect('/graphql');
    });

    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/', require('./Router/uploadRoute'));

    await new Promise(resolve => app.listen({ port: port }, resolve));
    console.log(
        `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`,
    );
    return { server, app };
})();
