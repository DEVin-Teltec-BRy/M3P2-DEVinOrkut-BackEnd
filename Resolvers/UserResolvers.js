const brcypt = require('bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');
const environment = require('../config/environment');
const validator = require('validator');
const { UserInputError } = require('apollo-server');
const { passwordValidator } = require('../helpers/functions');
const cpfValidator = require('../helpers/validatorCpf');
const sendEmail = require('../Helpers/email-send');

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
        sendEmailresetPassword: async (
            _,
            { user },
            { dataSources: { users } },
        ) => {
            try {
                const isEmailValid = await validator.isEmail(user.email);
                if (!isEmailValid) {
                    throw new UserInputError('Invalid argument value', {
                        argumentName: 'email',
                    });
                }
                const gmail = user.email
                const existingUser = await users.findByEmail(gmail);
                console.log(existingUser);
                if(existingUser.length ===0) return `Email enviado para ${user.email}`;
                const userObject = {
                    name: user.fullName,
                    email: user.email,
                };
                //enviar token no link
                const variables = {
                    link: `localhost:3000/resetpassword/${user.email}`,
                };
                sendEmail(userObject, variables, '../emails/reset-password');

                return `Email enviado para ${user.email}`;
            } catch (error) {
                return 'deu ruim';
            }
        },
        changePassword: async () => {},
    },
};

module.exports = userResolvers;
