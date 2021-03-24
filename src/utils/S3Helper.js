const S3 = require('aws-sdk/clients/s3');
const {AWS} = require("../config");
var mime = require('mime-types')
const FileType = require('file-type');

// ACL: private"|"public-read"|"public-read-write"|"authenticated-read"|"aws-exec-read"|"bucket-owner-read"|"bucket-owner-full-control"
class S3Helper {
    constructor() {
        this.s3 = new S3({
            signatureVersion: 'v4',
            accessKeyId: AWS.accessKeyId,
            secretAccessKey: AWS.secretKey,
            params: {
                Bucket: AWS.bucket
            },
            region: AWS.region,
        });
    }

    async exists(path) {
        try {
            const signedUrl = await this.s3.getObject({Key: path}).promise();
            return true
        } catch (headErr) {
            return false
        }
    }

    async upload(path, data) {
        const file = await FileType.fromBuffer(data)
        return await this.s3.upload({
                ACL: 'public-read',
                Body: data,
                Key: path,
                ContentType: file.mime,
            },

            (err) => {
                if (err) {
                    console.error(err, "EERRRRORRRRRRR")
                    return false
                }
            }).promise();
    }

    async remove(path) {
        const params = {Key: path};
        const fileExists = await this.s3.headObject(params).promise()
            .catch((e) => {
                console.log(params, e)
                return false
            })
        if (!fileExists) {
            return false
        }

        return this.s3.deleteObject(params).promise();
    }
}


module.exports = S3Helper;
