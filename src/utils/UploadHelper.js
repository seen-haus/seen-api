const S3 = require('aws-sdk/clients/s3');
const {AWS} = require("../config");
const multer = require("multer");
const multerS3 = require("multer-s3");


const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "video/mp4") {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
    }
};
const folderPrefix = 'media/v2/'
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

const ipfsFileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "video/mp4" || file.mimetype === "image/gif") {
        cb(null, true);
    } else {
        cb("Invalid file type: only JPEG, PNG, GIF & MP4 is allowed", false);
    }
};

const ipfsUpload = multer({
    fileFilter: ipfsFileFilter,
    limits: { fileSize: 25000000 } // 25 MB
})

module.exports = { upload, ipfsUpload };
