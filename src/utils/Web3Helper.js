const util = require('ethereumjs-util');
const Web3 = require('web3');

module.exports =  {
    async verifySignature(msg, sig, walletAddress) {
        const web3 = new Web3(null);
        const res = util.fromRpcSig(sig);
        const prefix = Buffer.from("\x19Ethereum Signed Message:\n");
        const prefixedMsg = web3.utils.sha3(Buffer.concat([prefix, Buffer.from(String(msg.length)), Buffer.from(msg)]));
        const pubKey = util.ecrecover(util.toBuffer(prefixedMsg), res.v, res.r, res.s);
        const addrBuf = util.pubToAddress(pubKey);
        const calcAddr = await util.bufferToHex(addrBuf);
        console.log({ 
            calcAddr,
            walletAddress
        })
        return (walletAddress.toLowerCase() === calcAddr);
    },

    /**
     * 
     * @param {string} messageJsonString Message to verify. Must have reason, account and timestamp fields in that order
     * @param {string} signature Signature to verify against. 
     * @param {string} walletAddress 
     * @returns {{ success: boolean, reason: string | undefined }}
     */
    async verifySignatureV2(messageJsonString, sig, walletAddress) {
        const messageParts = JSON.parse(messageJsonString);

        if(walletAddress.toLowerCase() !== messageParts.account.toLowerCase()){
            return {
                success: false,
                reason: "invalid signature message provided"
            };
        }

        if(!messageParts.hasOwnProperty('reason')){
            return {
                success: false,
                reason: "No signature reason provided"
            };
        }
        if(!messageParts.hasOwnProperty('timestamp')){
            return {
                success: false,
                reason: "No signature timestamp provided"
            };
        }
        if(!messageParts.hasOwnProperty('account')){
            return {
                success: false,
                reason: "No signature account provided"
            };
        }
        const { SIGNATURE_MAX_LIFESPAN } = process.env
        let currentTimestamp = Math.floor(new Date().getTime() / 1000);
        let secondsDifference = currentTimestamp - messageParts.timestamp;

        if(secondsDifference > SIGNATURE_MAX_LIFESPAN) {
            return {
                success: false,
                reason: `Signature too old`
            };
        }

        const reconstructedMessage =  `{"reason":"${messageParts.reason}","account":"${messageParts.account}","timestamp":${messageParts.timestamp}}`;
        const web3 = new Web3(null);
        const ecdsaSignature = util.fromRpcSig(sig);
        const prefix = Buffer.from("\x19Ethereum Signed Message:\n");
        const messageSha = web3.utils.sha3(Buffer.concat([prefix, Buffer.from(String(reconstructedMessage.length)), Buffer.from(reconstructedMessage)]));
        const pubKey = util.ecrecover(util.toBuffer(messageSha), ecdsaSignature.v, ecdsaSignature.r, ecdsaSignature.s);
        const addrBuf = util.pubToAddress(pubKey);
        const calcAddr = util.bufferToHex(addrBuf);

        if(walletAddress.toLowerCase() !== calcAddr.toLowerCase()){
            return {
                success: false,
                reason: `invalid signature message provided`
            };
        }
        return {
            success: true
        };
    }
}
