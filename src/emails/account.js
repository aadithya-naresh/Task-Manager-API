const sgMail = require('@sendgrid/mail')
const sendGridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridAPIKey)

const sendWelcomeMessage = (email,name) =>{
    sgMail.send({
        to:email,
        from:'aadithya.naresh5@gmail.com',
        subject:'Thanks for joining in!',
        text:`Welcome to the App , ${name}. Let me know how you get along.`
    })
}

const sendCancellationMessage = (email,name) =>{
    sgMail.send({
        to:email,
        from:'aadithya.naresh5@gmail.com',
        subject:'GoodBye, ${name}!',
        text:`Thank you, ${name}. Can you let us know what the problem was. We hope to see you soon. Thank you`
    })
}
module.exports = {
    sendWelcomeMessage,
    sendCancellationMessage
}