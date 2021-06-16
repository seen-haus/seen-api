const claimAdminEmailAddresses = process.env.CLAIMS_ADMIN_RECIPIENTS ? process.env.CLAIMS_ADMIN_RECIPIENTS.split(',') : [];

module.exports = Object.freeze({
    claimAdminEmailAddresses,
})