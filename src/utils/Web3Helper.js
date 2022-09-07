const util = require('ethereumjs-util');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');

module.exports =  {
    async verifySignature(msg, sig, walletAddress) {
        const web3 = new Web3(null);
        const res = util.fromRpcSig(sig);
        const prefix = Buffer.from("\x19Ethereum Signed Message:\n");
        const prefixedMsg = web3.utils.sha3(Buffer.concat([prefix, Buffer.from(String(msg.length)), Buffer.from(msg)]));
        const pubKey = util.ecrecover(util.toBuffer(prefixedMsg), res.v, res.r, res.s);
        const addrBuf = util.pubToAddress(pubKey);
        const calcAddr = await util.bufferToHex(addrBuf);
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
                reason: "invalid signature message provided (1)"
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
                reason: `invalid signature message provided (2)`
            };
        }
        return {
            success: true
        };
    },

    /**
     * 
     * @param {string} messageJsonString Message to verify. Must have reason, account and timestamp fields in that order
     * @param {string} signature Signature to verify against. 
     * @param {string} walletAddress 
     * @returns {{ success: boolean, reason: string | undefined }}
     */
     async verifySignatureCurationVote(messageJsonString, sig, walletAddress) {
        const messageParts = JSON.parse(messageJsonString);

        if(walletAddress.toLowerCase() !== messageParts.account.toLowerCase()){
            return {
                success: false,
                reason: "invalid signature message provided (1)"
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
        if(!messageParts.hasOwnProperty('applicant ID')){
            return {
                success: false,
                reason: "No signature applicant ID provided"
            };
        }
        if(!messageParts.hasOwnProperty('vote power') || new BigNumber(messageParts['vote power']).isLessThan(new BigNumber(0))){
            return {
                success: false,
                reason: "No signature vote power provided"
            };
        }
        if(!messageParts.hasOwnProperty('vote type') || (messageParts['vote type'] !== "no" && messageParts['vote type'] !== "yes")){
            return {
                success: false,
                reason: "No signature vote type provided"
            };
        }
        if(!messageParts.hasOwnProperty('round declaration ID')){
            return {
                success: false,
                reason: "No signature round declaration ID provided"
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

        if((messageParts['vote power'] % 1) !== 0) {
            return {
                success: false,
                reason: `Vote power must be an integer`
            };
        }

        const reconstructedMessage =  `{"reason":"${messageParts.reason}", "vote power":"${messageParts['vote power']}", "vote type":"${messageParts['vote type']}", "applicant ID": ${messageParts['applicant ID']}, "round declaration ID": ${messageParts['round declaration ID']}, "account":"${messageParts.account}", "timestamp":${messageParts.timestamp}}`;
        
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
                reason: `invalid signature message provided (2)`
            };
        }
        return {
            success: true
        };
    }
}
