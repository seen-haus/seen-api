const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY });

const sendMail = (to = [], subject,  message) => {
    try {
        if((message && message.length > 0) && (subject && subject.length > 0) && (to && to.length > 0)) {
            mg.messages.create(process.env.MAILGUN_DOMAIN, {
                from: `SEEN.HAUS <mailgun@${process.env.MAILGUN_DOMAIN}>`,
                to,
                subject,
                text: message,
                // html: "<h1></h1>"
            })
            .then(msg => console.log(msg)) // logs response data
            .catch(err => console.log(err)); // logs any error
        }else{
            console.log("To, subject & message required", {to, subject, message});
        }
    }catch(e){
        console.log({e})
    }
}

module.exports = { sendMail }