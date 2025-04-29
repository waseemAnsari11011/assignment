const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendResetPasswordEmail } = require("../utils/sendEmail");
const User = db.User;

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).send({ message: "User not found" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const resetLink = `http://yourfrontend.com/reset-password?token=${token}`;
  await sendResetPasswordEmail(
    email,
    "Reset your password",
    `Click here: ${resetLink}`
  );

  res.send({ message: "Reset link sent to your email" });
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    user.password = bcrypt.hashSync(newPassword, 8);
    await user.save();
    res.send({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).send({ message: "Invalid or expired token" });
  }
};
