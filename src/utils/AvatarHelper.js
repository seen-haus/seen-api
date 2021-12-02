const S3 = require('aws-sdk/clients/s3');
const {AWS} = require("../config");
const multer = require("multer");
const multerS3 = require("multer-s3");

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
    }
};

const maxSize = 1500000;
const folderPrefix = 'media/avatars/'
const s3 = new S3({
    signatureVersion: 'v4',
    accessKeyId: AWS.accessKeyId,
    secretAccessKey: AWS.secretKey,
    params: {
        Bucket: AWS.bucket
    },
    region: AWS.region,
});

const upload = multer({
    fileFilter,
    limits: {fileSize: maxSize},
    storage: multerS3({
        acl: "public-read",
        s3,
        bucket: AWS.bucket,
        contentType(req, file, cb) {
            cb(null, file.mimetype);
        },
        key: function (req, file, cb) {
            const fileName = Date.now().toString() + file.originalname.replace(/\s/g, "-")
            cb(null, folderPrefix + fileName.toLowerCase());
        },
    }),
});

module.exports = upload;
