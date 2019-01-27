import nodemailer from "nodemailer";
import env from "../../environment";

export const transporter = nodemailer.createTransport({
  ...env.mailer
});
