// middlewares/verifyAdmin.js
const db = require("../models");
const User = db.User;

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId); // Assuming req.userId is set by the verifyToken middleware

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access forbidden: Admins only" });
    }

    next(); // Allow the request to proceed if user is an admin
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { isAdmin };
