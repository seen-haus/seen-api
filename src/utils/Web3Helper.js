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

        return (walletAddress.toLowerCase() === calcAddr);
    }
}
