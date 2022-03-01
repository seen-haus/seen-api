const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const unsubscribe = 'https://seen.haus/notifications';

const sendMail = (to, subject, messageText, messageHtml) => {
    const msg = {
        to, // Change to your recipient
        from: 'info@seen.haus', // Change to your verified sender
        subject,
        text: messageText,
        html: messageHtml,
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
}

const sendOutbidNotification = (to, auctionLink, collectableTitle, collectableImage = false) => {
    if(to && auctionLink && collectableTitle) {
        const msg = {
            from: 'info@seen.haus',
            template_id: 'd-0fbf0858d62a41de974555cda1723a18',
            personalizations: [{
                to: { email: to },
                dynamic_template_data: {
                    auctionLink,
                    collectableTitle,
                    collectableImage,
                    unsubscribe,
                },
            }],
        }
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent')
            })
            .catch((error) => {
                console.error(error)
            })
    }
}

const sendClaimPageNotification = (to, claimLink, collectableTitle, collectableImage = false) => {
    if(to && claimLink && collectableTitle) {
        const msg = {
            from: 'info@seen.haus',
            template_id: 'd-e0a2513152b44cb2b4b1e67205210ea0',
            personalizations: [{
                to: { email: to },
                dynamic_template_data: {
                    claimLink,
                    collectableTitle,
                    collectableImage,
                    unsubscribe,
                },
            }],
        }
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent')
            })
            .catch((error) => {
                console.error(error)
            })
    }
}

const sendSelfMintingAccessRequestReceivedNotification = (to) => {
    if(to) {
        const msg = {
            from: 'info@seen.haus',
            template_id: 'd-e4d08ecb0172459f9076aa1deaac1f41',
            personalizations: [{
                to: { email: to },
                dynamic_template_data: {
                    unsubscribe,
                },
            }],
        }
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent')
            })
            .catch((error) => {
                console.error(error)
            })
    }
}

module.exports = { sendMail, sendOutbidNotification, sendClaimPageNotification, sendSelfMintingAccessRequestReceivedNotification };