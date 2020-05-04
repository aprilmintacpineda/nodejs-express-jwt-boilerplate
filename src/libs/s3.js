/** @format */

const aws = require('aws-sdk');

const s3 = new aws.S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key
});

function s3UploadAsync (config) {
  return new Promise((resolve, reject) => {
    s3.upload(config, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

module.exports.s3UploadAsync = s3UploadAsync;
