const { UserInputError } = require("apollo-server");
const sendEmail = require("../../Helpers/email-send");
const { ifFriendOrRequestThrowErro } = require("../../Helpers/functions");

const friendshipRequest = async (_, {senderId, requestedId}, { dataSources: { users }, userId }) => { 
  const loggedUser = await users.getUser(userId)
  if (!loggedUser ) {
    throw new UserInputError('Você precisa estar logado para fazer isso');
  }
  if(senderId !== userId) {
    throw new UserInputError('O usuário que enviou a solicitação de amizade não é o mesmo que está logado');
  }
  ifFriendOrRequestThrowErro(loggedUser.friends, requestedId);
  ifFriendOrRequestThrowErro(loggedUser.friendRequest, requestedId);
  const userRequested = await users.getUser(requestedId);
  if (!userRequested) {
    throw new UserInputError('Você esta enviando uma solicitação para um usuário que não existe.', {
      argumentName: 'requestedId',
    });
  }
  ifFriendOrRequestThrowErro(userRequested.friendRequest, senderId);
  ifFriendOrRequestThrowErro(userRequested.friends, senderId);  
  userRequested.friendRequest.push(loggedUser);
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
  return userRequested.save();
}

module.exports = friendshipRequest