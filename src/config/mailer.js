require('dotenv').config();
const nodeMailer = require('nodemailer');

let transporter = nodeMailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: false, // use SSL-TLS
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: 'quch niwq orcs nukh'
    },
    tls: {
        rejectUnauthorized: false
    }
});

let sendEmailNormal = (to, subject, htmlContent) => {
    let options = {
        from: process.env.MAIL_USERNAME,
        to: to,
        subject: subject,
        html: htmlContent
    };

    // return transporter.sendMail(options, (error, info) => {
    //     if (error) {
    //         return console.error('Error sending email:', error);
    //     }
    //     console.log('Email successfully sent:', info.messageId);
    // });

    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                reject(error); // Trả về lỗi khi gửi email thất bại
            } else {
                console.log('Email successfully sent:', info.messageId);
                resolve(true); // Trả về true khi gửi email thành công
            }
        });
    });
};

let sendEmailWithAttachment = (to, subject, htmlContent, filename, path) => {
    let options = {
        from: process.env.MAIL_USERNAME,
        to: to,
        subject: subject,
        html: htmlContent,
        attachments: [
            {
                filename: filename,
                path: path
            }
        ]
    };
    return transporter.sendMail(options);
}
    ;
module.exports = {
    sendEmailNormal: sendEmailNormal,
    sendEmailWithAttachment: sendEmailWithAttachment
};
