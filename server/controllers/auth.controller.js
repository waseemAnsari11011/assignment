const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const { sendVerificationEmail } = require("../utils/sendEmail");
const User = db.User;

exports.register = async (req, res) => {
  try {
    // The check for duplicate email is now handled by the verifySignUp middleware
    // If this controller function is reached, the email is unique.

    const { name, email, password, role } = req.body;
    // req.file will only exist if Multer ran successfully (i.e., validation passed)
    const profileImage = req.file?.filename || null;
    const hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hash,
      profileImage, // This will be null if no file was uploaded or validation failed
      isVerified: false,
      role: role,
    });

    const token = jwt.sign({ id: newUser.id }, config.accessTokenSecret, {
      expiresIn: "1d",
    });

    await sendVerificationEmail(email, token);

    res
      .status(201)
      .send({ message: "Registration successful! Check your email." });
  } catch (err) {
    // This catch block will handle errors during user creation or email sending
    res.status(500).send({ message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { id } = jwt.verify(req.params.token, config.accessTokenSecret);
    await User.update({ isVerified: true }, { where: { id } });
    res.send({ message: "Email verified successfully." });
  } catch (err) {
    res.status(400).send({ message: "Invalid or expired token." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).send({ message: "User not found." });
    if (!user.isVerified)
      return res.status(401).send({ message: "Email not verified." });

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send({ message: "Invalid password." });

    // Generate tokens
    const accessToken = jwt.sign({ id: user.id }, config.accessTokenSecret, {
      expiresIn: config.jwtExpiration, // e.g., '15m'
    });
    const refreshToken = jwt.sign({ id: user.id }, config.refreshTokenSecret, {
      expiresIn: config.jwtRefreshExpiration, // e.g., '7d'
    });

    // Set refreshToken in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Use HTTPS in production
      sameSite: "Strict", // or 'Lax'
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send accessToken in response body
    return res.status(200).send({ accessToken, user });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error." });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken)
      return res.status(403).send({ message: "No refresh token provided." });

    const payload = jwt.verify(refreshToken, config.refreshTokenSecret);

    console.log("payload==>>>", payload);

    const user = await User.findByPk(payload.id);
    if (!user)
      return res.status(403).send({ message: "Invalid refresh token." });

    const newAccessToken = jwt.sign({ id: user.id }, config.accessTokenSecret, {
      expiresIn: config.jwtExpiration,
    });

    res.send({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(403).send({ message: "Token expired or invalid." });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).send({ message: "User not found" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const resetLink = `http://yourfrontend.com/reset-password?token=${token}`;
  await sendEmail(email, "Reset your password", `Click here: ${resetLink}`);

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

exports.getAllUsers = async (req, res) => {
  const { search } = req.query;
  const condition = search
    ? {
        where: {
          name: { [Op.like]: `%${search}%` },
        },
      }
    : {};
  const users = await User.findAll(condition);
  res.send(users);
};

exports.getMyProfile = async (req, res) => {
  const user = await User.findByPk(req.userId, {
    attributes: { exclude: ["password"] },
  });
  res.send(user);
};

exports.updateMyProfile = async (req, res) => {
  const user = await User.findByPk(req.userId);
  const { name, image } = req.body;
  user.name = name || user.name;
  user.image = image || user.image;
  await user.save();
  res.send({ message: "Profile updated" });
};
