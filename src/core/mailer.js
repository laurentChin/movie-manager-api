const nodemailer = require("nodemailer");
const { mailer: mailerConfig } = require("../../environment");

const transporter = nodemailer.createTransport(mailerConfig);

module.exports = transporter;
