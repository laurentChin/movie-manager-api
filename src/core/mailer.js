const  nodemailer = require("nodemailer");
const env = require("../../environment");

const transporter = nodemailer.createTransport({
  ...env.mailer
});

module.exports = transporter;
