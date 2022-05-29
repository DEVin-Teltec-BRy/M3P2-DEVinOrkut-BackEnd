const brcypt = require('bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');
const environment = require('../Config/Environment');
const validator = require('validator');
const { UserInputError, AuthenticationError } = require('apollo-server');
const { passwordValidator } = require('../Helpers/functions');
const cpfValidator = require('../Helpers/validatorCpf');
const { typesOfUser } = require('./typesUser')
const sendEmail = require('../Helpers/email-send');
const Users = require('../Db/models/user');
const bcrypt = require('bcryptjs/dist/bcrypt');
const friendshipResolvers = require('./friendshipResolvers');

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
                if (!userId)
                    throw new AuthenticationError('you must be logged in');

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
        login: async(_, { email, password}, { dataSources: { users } } , info ) => {
          try {
              const [user] = await users.findByEmail(email) 
              if (!user) {
                throw new UserInputError('Usuario não encontrado', {
                    argumentName: 'email',
                });  
              }
              const isValid = await brcypt.compare(password, user.password)
              if (!isValid) {
                throw new UserInputError('Email ou senha invalido, tente novamente', {
                    argumentName: 'login',
                });
              }

              const token = jwt.sign({ userId: user._id }, secretKey)
         
              return {
                  token,
                  user
              }


          } catch (error) {
            throw new UserInputError('Email ou senha invalido, tente novamente', {
                argumentName: 'login',
            });
          }
        },
        refuseFriendship: friendshipResolvers.declineFriendship,
        requestFriendship: friendshipResolvers.friendRequest,
        removeFriendship: friendshipResolvers.removeFriendship,
        acceptRequest: friendshipResolvers.acceptRequest,
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
                const updatePassword = await Users.updateOne(
                    { email },
                    { password: hashedPass },
                );
                return `Nova senha cadastrada com sucesso.`;
            } catch (error) {
                return error;
            }
        },
    
    User:typesOfUser
};

module.exports = userResolvers;
