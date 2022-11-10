const aws = require("aws-sdk");

aws.config.update(
    {
        accessKeyId: "AKIAQ6BK7WR56ICUKSEE",
        secretAccessKey: "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",
        region: "ap-south-1"
    }
)

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: "2006-03-01" })

        var uploadParams = {
            //ACL: "public-read",
            Bucket: "meta-unite-server",
            Key: "profileImg/" + file.originalname,
            Body: file.buffer
        }
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }

            return resolve(data.Location)
        })
    })
}

module.exports = { uploadFile }

// const aws = require('aws-sdk')
// const multer = require('multer')
// const multerS3 = require('multer-s3');


// aws.config.update({
//     secretAccessKey: "+lsRXozr8e8wtkxjTNNy8g3KUp6fdHdtEP0QS4KS",
//     accessKeyId: "AKIAQ6BK7WR56ICUKSEE",
//     region: "ap-south-1"

// });
// const BUCKET = "meta-unite-server";
// const s3 = new aws.S3();

// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         //acl: "public-read",
//         bucket: BUCKET,
//         key: function (req, file, cb) {
//             console.log(file);
//             cb(null, file.originalname)
//         }
//     })
// })

// module.exports = upload