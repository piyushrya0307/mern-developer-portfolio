
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error("Email service is not configured.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  const info = await transporter.sendMail({
    from: emailUser,
    to,
    subject,
    text,
    replyTo: emailUser,
  });

  return info;
};

export default sendEmail;
