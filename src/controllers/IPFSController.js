const axios = require('axios');
const {body, validationResult} = require('express-validator');
const FormData = require('form-data');
const crypto = require('crypto');

const { IPFSMediaRepository } = require("../repositories");
const Web3Helper = require("./../utils/Web3Helper");
const Controller = require('./Controller');
const uploadHelper = require("./../utils/UploadHelper");

const PINATA_JWT = process.env.PINATA_JWT;

class IPFSController extends Controller {

    async pinFile(req, res) {
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

        const persistThis = this;

        let fnc = uploadHelper.ipfsUpload.array("files", 1)
        fnc(req, res, async (err) => {

                // Validate signature
                let parsedMessage = false;
                let signer = false;
                if(req.body.msg && JSON.parse(req.body.msg) && req.body.signature) {
                    parsedMessage = JSON.parse(req.body.msg);
                    if(!parsedMessage['timestamp']) {
                        this.sendError(res, 'Error: No signature timestamp provided', 400);
                        return;
                    }
                    if(!parsedMessage['account']) {
                        this.sendError(res, 'Error: No signature account provided', 400);
                        return;
                    }else{
                        signer = parsedMessage['account'];
                    }
                    let currentTimestamp = Math.floor(new Date().getTime() / 1000);
                    let secondsDifference = currentTimestamp - Number(parsedMessage['timestamp']);
                    // Checks that signature is less than 10 minutes old
                    if(secondsDifference < 600) {
                        // Check that signature is signed by account provided
                        let reconstructedMessage = `{"reason":"Distribute file via SEEN.HAUS IPFS Gateway","account":"${signer}","timestamp":${parsedMessage['timestamp']}}`;
                        let isValidSignature = await Web3Helper.verifySignature(reconstructedMessage, req.body.signature, signer);
                        if(!isValidSignature) {
                            this.sendError(res, 'Error: invalid signature provided', 400);
                            return;
                        } else {
                            // TODO, check that account has IPFS permissions (i.e. hasRole minter/escrowAgent on the smart contracts)
                        }
                    } else {
                        this.sendError(res, 'Error: signature must be less than 10 minutes old', 400);
                        return;
                    }
                }else{
                    this.sendError(res, 'Error: invalid signature message provided', 400);
                    return;
                }

                if (err) {
                    console.log({err})
                    this.sendError(res, err, 400);
                    return;
                }

                let file = req.files[0];

                let data = new FormData();

                const sha256Hash = crypto.createHash('sha256');

                sha256Hash.write(file.buffer);

                sha256Hash.on('readable', () => {

                    const hashData = sha256Hash.read();

                    if (hashData) {
                        data.append('file', file.buffer, {filename: hashData.toString('hex')});
                        axios
                            .post(url, data, {
                                maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
                                headers: {
                                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                                    'Authorization': `Bearer ${PINATA_JWT}`,
                                }
                            })
                            .then(async (response) => {
                                console.log({response})
                                if(response.data.IpfsHash) {

                                    await IPFSMediaRepository.create({
                                        uploader_address: signer,
                                        ipfs_hash: response.data.IpfsHash,
                                        mime_type: file.mimetype,
                                        file_size: file.size
                                    });

                                    persistThis.sendResponse(res, {
                                        ipfsHash: response.data.IpfsHash
                                    })
                                } else {
                                    console.error({pinataError: response.data})
                                    persistThis.sendResponse(res, "IPFS GATEWAY ERROR")
                                }
                            })
                            .catch(function (error) {
                                console.log({error})
                                persistThis.sendResponse(res, "ERROR")
                            });
                    }
                })

                sha256Hash.end();
            }
        )
    }
}

module.exports = IPFSController;
