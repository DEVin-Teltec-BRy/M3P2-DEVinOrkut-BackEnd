const bcrypt = require('bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');
const environment = require('../Config/Environment');
const validator = require('validator');
const { UserInputError, AuthenticationError } = require('apollo-server');
const { passwordValidator, getAge } = require('../Helpers/functions');
const cpfValidator = require('../Helpers/validatorCpf');
const { typesOfUser } = require('./typesUser');
const sendEmail = require('../Helpers/email-send');
const Users = require('../Db/models/user');
const Testimonial = require('../Db/models/testimonial');
const friendshipResolvers = require('./friendshipResolvers');
const { host_front, host_back } = require('../Config/Environment');
const socialRelationshipsResolvers = require('./socialRelationshipsResolvers');

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
                    throw new AuthenticationError('Você deve estar logado');

                const listUser = await users.searchUserByName(param);
                const listCommunities = await communities.searchCommunityByName(
                    param,
                );

                return [...listUser, ...listCommunities];
            } catch (error) {
                throw new AuthenticationError('Error: ' + error.message);
            }
        },
        readTestimonials: async (_, { user }, { userId }) => {
            try {
                if (!userId)
                    throw new AuthenticationError('Você deve estar logado');
                const data = await Users.findById(user);
                if (!data) return 'Usuário inexistente';
                const testimonials = data.testimonial;
                if (!testimonials) return 'Usuário não possui depoimentos';
                const testimonialsResult = await Promise.all(
                    testimonials.map(item => {
                        return Testimonial.findById(item);
                    }),
                );
                return testimonialsResult;
            } catch (error) {
                return error;
            }
        },
        getFriends: async (
            _,
            { pagination },
            { dataSources: { users }, userId },
        ) => {
            const { page, per_page } = pagination;
            if (!userId)
                throw new AuthenticationError('Você deve estar logado');
            if (Number(page) <= 0) {
                throw new UserInputError('Erro: Pagina não valida.');
            }
            if (Number(per_page) <= 0) {
                throw new UserInputError(
                    'Erro: Precisa informar um numero de items > 0',
                );
            }

            return await users.getFriends(userId, page, per_page);
        },
    },
    Mutation: {
        createUser: async (_, { user }, { dataSources: { users } }) => {
            try {
                const age = getAge(user.birthDate);
                if (age < 18) {
                    throw new UserInputError(
                        'Você precisa ter 18 anos ou mais para se cadastrar',
                    );
                }

                const isEmailValid = await validator.isEmail(user.email);
                if (!isEmailValid) {
                    throw new UserInputError(
                        'Erro: Não foi possivel efetuar este processo, valores passados são invalidos.',
                        {
                            argumentName: 'email',
                        },
                    );
                }

                const isValidPassword = await passwordValidator(user.password);
                if (!isValidPassword) {
                    throw new UserInputError(
                        'A senha deve conter pelo menos 8 caracteres, uma maiúscula, um número e um caractere especial.',
                        {
                            argumentName: 'password',
                        },
                    );
                }

                const isCpfValid = cpf.isValid(user.cpf);
                if (!isCpfValid) {
                    throw new UserInputError(
                        'Não foi possivel efetuar este processo, valores passados são invalidos.',
                        {
                            argumentName: 'cpf',
                        },
                    );
                }

                const isUserEmailExist = await Users.findOne({
                    email: user.email,
                });

                if (isUserEmailExist) {
                    throw new UserInputError('Email já cadastrado.', {
                        argumentName: 'email',
                    });
                }

                const isUserCpfExist = await Users.findOne({ cpf: user.cpf });

                if (isUserCpfExist) {
                    throw new UserInputError('CPF já cadastrado.', {
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
                throw new UserInputError(`${error.message}`, {
                    argumentName: 'password',
                });
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
        addFan: socialRelationshipsResolvers.addFan,
        removeFan: socialRelationshipsResolvers.removeFan,

        sendEmailresetPassword: async (
            _,
            { user },
            { dataSources: { users } },
        ) => {
            try {
                const isEmailValid = await validator.isEmail(user.email);
                if (!isEmailValid) {
                    throw new UserInputError(
                        'Erro: Não foi possivel efetuar este processo, valores passados são invalidos.',
                        {
                            argumentName: 'email',
                        },
                    );
                }

                const gmail = user.email;
                const existingUser = await users.findByEmail(gmail);
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
                const variables = {
                    linkLogo: `${host_back}/assets/imgs/logo.png`,
                    redirectLink: `${host_front}/resetpass/${Token}`,
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
                const isValidPassword = await passwordValidator(
                    user.newPassword,
                );
                if (!isValidPassword) {
                    throw new UserInputError(
                        'A senha deve conter pelo menos 8 caracteres, uma maiúscula, um número e um caractere especial.',
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
                if (Object.hasOwn(error, 'expiredAt')) return 'Token Expirado';
                return error;
            }
        },
        validatedToken: async (
            _,
            { token },
            { dataSources: { users }, userId },
        ) => {
            try {
                if (!userId) {
                    throw new UserInputError('Usuario não logado');
                }
                jwt.verify(token, secretKey);

                return {
                    token,
                    user: users.getUser(userId),
                };
            } catch (error) {
                if (error.message === 'jwt malformed') {
                    throw new UserInputError('Formato de token não valido');
                }

                if (error.message === 'jwt expired') {
                    const token = jwt.sign({ userId }, secretKey, {
                        expiresIn: '1d',
                    });
                    return {
                        token,
                        user: users.getUser(userId),
                    };
                }
            }
        },
        createTestimonial: async (_, { input }) => {
            try {
                const user = await Users.findById(input.userId);
                const from = await Users.findById(input.from);
                if (!user) return 'Destinatário  inexistente';
                if (!from) return 'Usuário inexistente';
                const newTestimonial = await Testimonial.create({
                    userId: input.userId,
                    from: input.from,
                    name: from.fullName,
                    testimonial: input.testimonial,
                });

                const insertTestimonial = await Users.updateOne(
                    { _id: user._id },
                    { $push: { testimonial: newTestimonial._id } },
                );
                if (insertTestimonial.modifiedCount !== 1)
                    return 'Erro ao criar depoimento';

                return 'Depoimento criado com sucesso';
            } catch (error) {
                return error;
            }
        },
        updateUser: async (_, { input }) => {
            try {
                const {id, ...dados} = input
                const user = await Users.findById(id);
                if (!user) return 'Usuário  inexistente';

                const newUserData = await Users.updateOne(
                    { _id: user.id },
                    { ...dados },
                );
                if (newUserData.modifiedCount === 0) return 'Nenhum dado atualizado';
                return newUserData;
            } catch (error) {
                return error;
            }
        },
    },
    User: typesOfUser,
};

module.exports = userResolvers;
