const { UserInputError } = require("apollo-server");
const sendEmail = require("../../Helpers/email-send");
const { ifFriendOrRequestThrowErro } = require("../../Helpers/functions");

const friendshipRequest = async (_, {senderId, requestedId}, { dataSources: { users }, userId, hostname }) => { 
  if(!userId) {
    throw new UserInputError('Você precisa estar logado para fazer isso');
  }
  if(senderId !== userId._id) {
    throw new UserInputError('O usuário que enviou a solicitação de amizade não é o mesmo que está logado');
  }
  ifFriendOrRequestThrowErro(userId.friends, requestedId);
  ifFriendOrRequestThrowErro(userId.friendRequest, requestedId);
  const userRequested = await users.getUser(requestedId);
  if (!userRequested) {
    throw new UserInputError('Você esta enviando uma solicitação para um usuário que não existe.', {
      argumentName: 'requestedId',
    });
  }
  ifFriendOrRequestThrowErro(userRequested.friendRequest, senderId);
  ifFriendOrRequestThrowErro(userRequested.friends, senderId);  
  userRequested.friendRequest.push(userId);
  const sendEmailTo = {
    name: userRequested.name,
    email: userRequested.email,
  }

  const variables = {
    senderName: userId.name,
    link: "link para direcionar a tela de solicitações.",
    host: hostname,
    user: sendEmailTo,
  }
  sendEmail(sendEmailTo, variables, 'invite-friend');
  return userRequested.save();
}

module.exports = friendshipRequest