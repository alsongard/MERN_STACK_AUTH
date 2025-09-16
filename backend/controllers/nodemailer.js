require("dotenv").config();

const nodemailer = require("nodemailer");

//console.log(process.env.MONGO_PASSWD)
// think of a transport as somehow similar to a channel. 
// channel used to send something

//console.log(process.env.SMTP_HOST)

//console.log(`host: ${process.env.SMTP_HOST}`);
//console.log(`port: ${process.env.SMTP_PORT}`);
//console.log(`user: ${process.env.SMTP_USER}`);
//console.log(`key: ${process.env.SMTP_KEY}`);
//console.log(`senderEmail: ${process.env.SMPT_SENDER_EMAIL}`)

console.log(`helo`)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, 
    port: process.env.SMTP_PORT, 
    auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_KEY
    }
});
module.exports = transporter;



