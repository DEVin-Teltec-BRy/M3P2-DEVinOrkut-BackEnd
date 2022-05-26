const path = require('path')

const { configEmail } = require('../config/environment');

const nodemailer = require('nodemailer')
const Email = require('email-templates');

const transport = nodemailer.createTransport(configEmail)


const email = new Email({
  message: {
    from: 'no-reply@orkut.com'
  },
  send: true,
  transport,
});
const sendEmail = async (user, sender, templateName) => {
    try {
     return await email.send({
        template: templateName,
        message: {
          to: user.email
        },
        locals: {
          name: user.name,
          senderName: sender.name,
          link: `http://localhost:3000/invite/${sender.id}`
        },
        preview: false,
      })
    } catch (error) {
        console.error("O erro é: ", error);
    }
}
module.exports = sendEmail;