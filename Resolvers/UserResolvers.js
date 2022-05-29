const brcypt = require('bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');
const environment = require('../Config/Environment');
const validator = require('validator');
const { UserInputError, AuthenticationError } = require('apollo-server');
const { passwordValidator } = require('../Helpers/functions');
const cpfValidator = require('../Helpers/validatorCpf');
const { typesOfUser } = require('./typesUser')
const { declineFriendship, friendRequest } = require('./friendshipResolvers');

const secretKey = environment.jwtAccessTokenSecret;
const cpf = new cpfValidator();

// resolvers
const userResolvers = {
    SearchResult: {
        __resolveType(obj) {
            if (obj.fullName) {
                return 'User';
            }
            if (obj.name) {
                return 'Community';
            }
            return null;
        },
    },
    Query: {
        user: async (_, { id }, { dataSources: { users }, userId }) => {
            try {
                if (!userId)
                    throw new AuthenticationError('you must be logged in');
                return users.getUser(id);
            } catch (error) {
                console.log(error);
            }
        },
        users: async (_, __, { dataSources: { users }, userId }) => {
            try {
                if (!userId)
                    throw new AuthenticationError('you must be logged in');
                return users.getAll();
            } catch (error) {
                console.log(error);
            }
        },
        searchParam: async (
            _,
            { param },
            { dataSources: { users, communities }, userId },
        ) => {
            try {
                // if (!userId)
                //     throw new AuthenticationError('you must be logged in');

                const listUser = await users.searchUserByName(param);
                const listCommunities = await communities.searchCommunityByName(param);

                return [...listUser, ...listCommunities];
            } catch (error) {
                console.log(error);
            }
        },
    },
    Mutation: {
        createUser: async (_, { user }, { dataSources: { users } }) => {
            try {
                const isEmailValid = await validator.isEmail(user.email);
                if (!isEmailValid) {
                    throw new UserInputError('Invalid argument value', {
                        argumentName: 'email',
                    });
                }

                const isValidPassword = await passwordValidator(user.password);
                if (!isValidPassword) {
                    throw new UserInputError(
                        'Password must contain at least 8 characters, one uppercase, one number and one special case character',
                        {
                            argumentName: 'password',
                        },
                    );
                }

                const isCpfValid = cpf.isValid(user.cpf);
                if (!isCpfValid) {
                    throw new UserInputError('Invalid argument value', {
                        argumentName: 'cpf',
                    });
                }

                const password = await brcypt.hash(user.password, 10);
                const userCreated = await users.create({ ...user, password });
                //adicionar expires.
                const token = jwt.sign({ userId: userCreated._id }, secretKey);

                return {
                    token,
                };
            } catch (error) {
                console.log(error);
            }
        },
        refuseFriendship: declineFriendship,
        requestFriendship: friendRequest
    },
    User: typesOfUser,
};

module.exports = userResolvers;
