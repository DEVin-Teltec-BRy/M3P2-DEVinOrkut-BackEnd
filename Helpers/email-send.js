const path = require('path')

const { configEmail } = require('../Config/Environment');

const nodemailer = require('nodemailer')
const Email = require('email-templates');

const transport = nodemailer.createTransport(configEmail)

const email = new Email({
  message: {
    from: 'no-reply@orkut.com',
  },
  send: true,
  transport
});
/**
 * Função para enviar email
 * @param {Object} user É o usuario de destino do email dados minimos: email e nome.
 * @param {Object} variables É o objeto que será passado para o template, as chaves deste objeto se tornaram variaveis dentro do template.
 * @param {String} templateName É o nome da pasta que contém o template.
 * @returns 
 */
const sendEmail = async (user, variables, templateName) => {
    try {
        return await email.send({
            template: templateName,
            message: {
                to: user.email
            },
            locals: {...variables, user},
            preview: false,
            })
        } catch (error) {
            throw new Error("Erro no envio do email: "+ error.message);
       }
   }
   module.exports = sendEmail;