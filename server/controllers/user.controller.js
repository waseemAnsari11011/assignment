const db = require("../models");
const User = db.User;
const { Op } = require("sequelize");

exports.getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

    // Ensure limit and page are integers and properly handle invalid input
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Calculate offset (which row to start from)
    const offset = (pageNumber - 1) * pageSize;

    // Define the condition for search
    const condition = search
      ? {
          where: {
            name: { [Op.like]: `%${search}%` },
          },
        }
      : {};

    // Fetch users with pagination
    const { count, rows } = await User.findAndCountAll({
      ...condition,
      limit: pageSize, // Limit the number of users
      offset, // Skip the appropriate number of users for pagination
    });

    // Send response with users and pagination info
    res.json({
      users: rows,
      totalUsers: count,
      totalPages: Math.ceil(count / pageSize), // Calculate total number of pages
      currentPage: pageNumber,
      pageSize: pageSize,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] }, // hide password from response
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name } = req.body;
    const image = req.file ? req.file.filename : user.profileImage; // Use existing image if no new one is uploaded

    // Update only fields that are provided
    if (name !== undefined) user.name = name;
    if (req.file) user.profileImage = image; // Update image if a new one was uploaded

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the admin doesn't try to delete themselves (this check is for both admins and regular users)
    if (id == req.userId) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy(); // Delete the user

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
