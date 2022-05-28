# Função para enviar e-mail.

Exemplo de uso da função para enviar e-mail.

```js

const sendEmail = require('./helpers/email-send')

const user = {
    email: 'httpdaniel@yahoo.com.br',
    name: 'Daniel',
}
const variables = {
    id: '1',
    senderName: 'Maria',
    email: 'maria@gmail.com.br',
    link: 'http://localhost:3000/',
}
sendEmail(user, variables, 'invite-friend')
```
## Os parâmetros.

O primeiro parâmetro é para quem será enviado o e-mail, logo é indispensável que seja passado o email de destino.
 
O segundo parâmetro são as variáveis que serão utilizadas dentro do template.

A função usará o template devido dentro da pasta ./emails
O último parâmetro da função deve ser o nome da pasta onde o template se encontra.
 
 