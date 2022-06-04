const { UserInputError } = require("apollo-server");
const sendEmail = require("../../Helpers/email-send");
const { checkRequest } = require("../../Helpers/functions");

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
    redirectLink: "http://localhost:3000/assets/imgs/logo.png",
    linkLogo: "http://localhost:3000/assets/imgs/logo.png",
  }
  sendEmail(sendEmailTo, variables, 'invite-friend');
  await loggedUser.save();
  await userRequested.save();
  return loggedUser;
}

module.exports = friendshipRequest