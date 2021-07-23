const axios = require('axios');
const {body, validationResult} = require('express-validator');
const FormData = require('form-data');
const crypto = require('crypto');

const Controller = require('./Controller');
const uploadHelper = require("./../utils/UploadHelper");

const PINATA_JWT = process.env.PINATA_JWT;

class IPFSController extends Controller {

    async pinFile(req, res) {
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

        const persistThis = this;

        let fnc = uploadHelper.ipfsUpload.array("files", 1)
        fnc(req, res, async (err) => {
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
                            .then(function (response) {
                                console.log({response})
                                if(response.data.IpfsHash) {
                                    persistThis.sendResponse(res, {
                                        ipfsHash: response.data.IpfsHash
                                    })
                                } else {
                                    console.error({pinataError: response.data})
                                    persistThis.sendResponse(res, "IPFS GATEWAY ERROR")
                                }
                            })
                            .catch(function (error) {
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
