const { UserInputError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const environment = require('../Config/Environment');

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

const ifFriendOrRequestThrowErro = (arrObjIds, userId) => {
    const hasResult = arrObjIds.find(objectId => objectId.toString() === userId);
    if(hasResult) {
      throw new UserInputError('Usuário ja é seu amigo ou ja existe uma solicitação.', {
        argumentName: 'requestedId',
      });
    }
  }
module.exports = {
    getUserId,
    passwordValidator,
    ifFriendOrRequestThrowErro,
};
