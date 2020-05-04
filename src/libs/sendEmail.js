/** @format */

const aws = require('aws-sdk');

const sesv2 = new aws.SESV2({
  apiVersion: '2019-09-27',
  region: process.env.aws_ses_region,
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key
});

module.exports = ({ recipient, content, subject, emailType }) => {
  return new Promise(resolve => {
    sesv2.sendEmail(
      {
        Content: {
          Simple: {
            Body: {
              Html: {
                Data: content
              }
            },
            Subject: {
              Data: subject
            }
          }
        },
        Destination: {
          ToAddresses: [recipient]
        },
        EmailTags: [
          {
            Name: 'Email-Type',
            Value: emailType
          }
        ],
        FromEmailAddress: process.env.aws_ses_email
      },
      error => {
        console.log(error);
        resolve();
      }
    );
  });
};
