const { UserInputError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const environment = require('../Config/Environment');
const validator = require('validator');

const secretKey = environment.jwtAccessTokenSecret;

function getTokenPayload(token) {
    return jwt.verify(token, secretKey);
}

function getUserId(req, authToken) {
    if (req) {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            if (!token) {
                throw new Error('No token found');
            }
            const { userId } = getTokenPayload(token);
            return userId;
        }
    } else if (authToken) {
        const { userId } = getTokenPayload(authToken);
        return userId;
    }

    throw new Error('Not authenticated');
}

function passwordValidator(password) {
    return password.match(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
    );
}

const ifFriendOrRequestThrowError = (arrObjIds, userId) => {
    const hasResult = arrObjIds.find(
        objectId => objectId.toString() === userId,
    );
    if (hasResult) {
        throw new UserInputError(
            'Usuário ja é seu amigo ou ja existe uma solicitação.',
            {
                argumentName: 'requestedId',
            },
        );
    }
};

const validateInputLogin =  (email, password) =>{

    const isEmailValid =  validator.isEmail(email);
    // const isValidPassword =  passwordValidator(password);

    if (!isEmailValid) {
        console.log('email is not valid')
        throw new UserInputError('Erro: Não foi possivel efetuar este processo, o email passado é invalido.', {
            argumentName: 'email',
        });
    }

    if(!isValidPassword) {
        console.log('pass is not valid')
        throw new UserInputError(
            'Senha inválida. A senha deve conter pelo menos 8 caracteres, uma maiúscula, um número e um caractere especial.',
            {
                argumentName: 'password',
            },
        );
    }

    console.log('é valido')
    return true;

 }

module.exports = {
    getTokenPayload,
    getUserId,
    passwordValidator,
    checkRequest: ifFriendOrRequestThrowError,
    validateInputLogin,
};
