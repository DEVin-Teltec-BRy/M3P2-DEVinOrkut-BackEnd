const brcypt = require('bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');
const environment = require('../config/environment');
const validator = require('validator');
const { UserInputError, AuthenticationError } = require('apollo-server');
const { passwordValidator } = require('../helpers/functions');
const cpfValidator = require('../helpers/validatorCpf');
const sendEmail = require('../Helpers/email-send');
const User = require('../Db/models/user');
const bcrypt = require('bcryptjs/dist/bcrypt');

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
                const gmail = user.email;
                const existingUser = await users.findByEmail(gmail);
                console.log(existingUser);
                if (existingUser.length === 0)
                    return `Email enviado para ${user.email}`;
                const Token = jwt.sign(
                    { email: gmail },
                    process.env.JWT_ACCESS_TOKEN_SECRET,
                    { expiresIn: '15m' },
                );
                const userObject = {
                    fullName: 'Usuário DEVinOrkut',
                    email: user.email,
                };
                console.log(Token);
                //enviar token no link
                const variables = {
                    link: `localhost:3000/resetpassword/${Token}`,
                };
                sendEmail(userObject, variables, '../emails/reset-password');

                return `Email enviado para ${user.email}`;
            } catch (error) {
                return 'Email enviado';
            }
        },
        changePassword: async (_, { user }, { dataSources: { users } }) => {
            try {
                if (user.newPassword !== user.confirmPassword)
                    return 'A confirmação de senha precisa ser igual a nova senha.';
                const validatingToken = jwt.verify(
                    user.token,
                    process.env.JWT_ACCESS_TOKEN_SECRET,
                );
                console.log(validatingToken);
                const email = validatingToken.email;
                const hashedPass = await bcrypt.hash(user.newPassword, 10);
                const updatePassword = await User.updateOne(
                    { email },
                    { password: hashedPass },
                );
                return `Nova senha cadastrada com sucesso.`;
            } catch (error) {
                return error;
            }
        },
    },
};

module.exports = userResolvers;
