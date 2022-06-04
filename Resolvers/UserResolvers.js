const bcrypt = require('bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');
const environment = require('../Config/Environment');
const validator = require('validator');
const { UserInputError, AuthenticationError } = require('apollo-server');
const { passwordValidator } = require('../Helpers/functions');
const cpfValidator = require('../Helpers/validatorCpf');
const { typesOfUser } = require('./typesUser');
const sendEmail = require('../Helpers/email-send');
const Users = require('../Db/models/user');
const Testimonial = require('../Db/models/testimonial')
const friendshipResolvers = require('./friendshipResolvers');
const Environment = require('../Config/Environment');

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
    TokenResult: {
        __resolveType(obj) {
            if (obj.token) {
                return 'AuthPayload';
            }
            if (obj.message) {
                return 'Error';
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
                throw new Error(error);
            }
        },
        users: async (_, __, { dataSources: { users }, userId }) => {
            try {
                if (!userId)
                    throw new AuthenticationError('you must be logged in');
                return users.getAll();
            } catch (error) {
                throw new Error(error);
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
                const listCommunities = await communities.searchCommunityByName(
                    param,
                );

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

                const password = await bcrypt.hash(user.password, 10);
                const userCreated = await users.create({ ...user, password });

                const token = jwt.sign({ userId: userCreated._id }, secretKey, {
                    expiresIn: '1d',
                });

                return {
                    token,
                };
            } catch (error) {
                console.log(error);
            }
        },
        login: async (
            _,
            { email, password },
            { dataSources: { users } },
            info,
        ) => {
            try {
                const [user] = await users.findByEmail(email);
                if (!user) {
                    throw new UserInputError('Usuario não encontrado', {
                        argumentName: 'email',
                    });
                }
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    throw new UserInputError(
                        'Email ou senha invalido, tente novamente',
                        {
                            argumentName: 'login',
                        },
                    );
                }

                const token = jwt.sign({ userId: user._id }, secretKey, {
                    expiresIn: '1d',
                });

                return {
                    token,
                    user,
                };
            } catch (error) {
                throw new UserInputError(
                    'Email ou senha invalido, tente novamente',
                    {
                        argumentName: 'login',
                    },
                );
            }
        },
        refuseFriendship: friendshipResolvers.declineFriendship,
        requestFriendship: friendshipResolvers.friendRequest,
        removeFriendship: friendshipResolvers.removeFriendship,
        acceptRequest: friendshipResolvers.acceptRequest,

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
                    redirectLink: `http://localhost:3000/resetpass/${Token}`,
                };
                sendEmail(userObject, variables, '../emails/reset-password');

                return `Email enviado para ${user.email}`;
            } catch (error) {
                return 'Email enviado';
            }
        },
        changePassword: async (_, {user}, { dataSources: { users } }) => {
            try {
                if (user.newPassword !== user.confirmPassword)
                    return 'A confirmação de senha precisa ser igual a nova senha.';
                const validatingToken = jwt.verify(
                    user.token,
                    process.env.JWT_ACCESS_TOKEN_SECRET,
                );
                const isValidPassword = await passwordValidator(user.newPassword);
                if (!isValidPassword) {
                    throw new UserInputError(
                        'Password must contain at least 8 characters, one uppercase, one number and one special case character',
                        {
                            argumentName: 'newPassword',
                        },
                    );
                }
                const email = validatingToken.email;
                const hashedPass = await bcrypt.hash(user.newPassword, 10);
                const updatePassword = await Users.updateOne(
                    { email },
                    { password: hashedPass },
                );
                return `Nova senha cadastrada com sucesso.`;
            } catch (error) {
               
               if(Object.hasOwn(error,"expiredAt")) return "Token Expirado"
               return error
            }
        },
        refreshToken: async (_, { token }, { userId }) => {
            try {
                jwt.verify(token, secretKey);
            } catch (error) {
                if (error.message === 'jwt expired') {
                    const token = jwt.sign({ userId }, secretKey, {
                        expiresIn: "1d",
                    });
                    return {
                        token,
                    };
                }
                const message =
                    error.message === 'jwt malformed'
                        ? 'Token não valido'
                        : error.message;

                return {
                    message,
                };
            }
        },
        createTestimonial:async (_, { input })=>{
            try {
                const user = await Users.findById(input.userId)
                const from = await Users.findById(input.from)
                if(!user) return "Destinatário  inexistente"
                if(!from) return "Usuário inexistente"
                const newTestimonial = await Testimonial.create({
                    userId:input.userId,
                    from:input.from,
                    name:from.fullName,
                    testimonial:input.testimonial
                })
            
                const insertTestimonial = await Users.updateOne(
                    {_id:user._id},
                    {$push:{testimonial:newTestimonial._id}}
                )
                if(insertTestimonial.modifiedCount!==1) return "Erro ao criar depoimento"
                
                return "Depoimento criado com sucesso"
            } catch (error) {
                return error
            }
        }
    },
    User: typesOfUser,
};

module.exports = userResolvers;
