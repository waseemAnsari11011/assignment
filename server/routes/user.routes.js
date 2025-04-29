const express = require("express");
const user = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/authJwt"); // Import the middleware
const upload = require("../middlewares/upload");
const { isAdmin } = require("../middlewares/verifyAdmin");

module.exports = (app) => {
  const router = express.Router();

  // Get all users (with optional search)
  router.get("/", verifyToken, user.getAllUsers);

  // Get user by ID
  router.get("/:id", verifyToken, user.getUserById);

  // Update logged-in user's profile
  router.patch(
    "/me",
    verifyToken,
    upload.single("profileImage"),
    user.updateMyProfile
  ); // Using verifyToken here

  // Delete a user (Only accessible by admin)
  router.delete("/:id", verifyToken, isAdmin, user.deleteUser);

  app.use("/api/users", router);
};
