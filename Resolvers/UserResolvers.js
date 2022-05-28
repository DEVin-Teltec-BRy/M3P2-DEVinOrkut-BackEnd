const brcypt = require('bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');
const environment = require('../config/Environment');
const validator = require('validator');
const { UserInputError } = require('apollo-server');
const { passwordValidator } = require('../helpers/functions');
const cpfValidator = require('../helpers/validatorCpf');

const secretKey = environment.jwtAccessTokenSecret;
const cpf = new cpfValidator();

// resolvers
const userResolvers = {
    Query: {
        users: async (_, { id }, { dataSources: { users } }) =>
            users.getUser(id),
        users: async (_, __, { dataSources: { users } }) => users.getAll(),
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
                const token = jwt.sign({ userId: userCreated }, secretKey);

                return {
                    token,
                    user: userCreated,
                };
            } catch (error) {
                console.log(error);
            }
        },
    },
};

module.exports = userResolvers;
