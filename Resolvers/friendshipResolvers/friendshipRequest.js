const { UserInputError } = require("apollo-server");
const sendEmail = require("../../Helpers/email-send");
const { checkRequest } = require("../../Helpers/functions");
const { host_front, host_back } = require("../../Config/Environment");

const friendshipRequest = async (_, {senderId, requestedId}, { dataSources: { users }, userId }) => { 
  const loggedUser = await users.getUser(userId)
  if (!loggedUser ) {
    throw new UserInputError('Você precisa estar logado para fazer isso');
  }
  if(senderId !== userId) {
    throw new UserInputError('O usuário que enviou a solicitação de amizade não é o mesmo que está logado');
  }
  checkRequest(loggedUser.friends, requestedId);
  const userRequested = await users.getUser(requestedId);
  if (!userRequested) {
    throw new UserInputError('Você esta enviando uma solicitação para um usuário que não existe.', {
      argumentName: 'requestedId',
    });
  }
  checkRequest(userRequested.friendRequest, senderId);
  checkRequest(userRequested.friends, senderId);  
  userRequested.friendRequest.push(loggedUser._id);

  const sendEmailTo = {
    name: userRequested.fullName,
    email: userRequested.email,
  }

  const variables = {
    senderName: loggedUser.fullName,
    redirectLink: `${host_front}/solicitacoes`,
    linkLogo: `${host_back}/assets/imgs/logo.png`,
  }
  sendEmail(sendEmailTo, variables, 'invite-friend');
  await userRequested.save();
  return userRequested;
}

module.exports = friendshipRequest