const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.sendVerificationEmail = async (to, token) => {
  const link = `http://localhost:3000/auth/verify/${token}`;
  await transporter.sendMail({
    from: "no-reply@yourapp.com",
    to,
    subject: "Email Verification",
    html: `<p>Click <a href='${link}'>here</a> to verify your email.</p>`,
  });
};

exports.sendResetPasswordEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: "no-reply@yourapp.com",
    to,
    subject,
    text,
  });
};
