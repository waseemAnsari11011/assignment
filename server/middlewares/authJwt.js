const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.User;

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  console.log(token);

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  // Remove "Bearer " part of the token if included
  const tokenWithoutBearer = token.startsWith("Bearer ")
    ? token.slice(7, token.length)
    : token;

  jwt.verify(
    tokenWithoutBearer,
    process.env.JWT_ACCESS_SECRET,
    async (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Unauthorized! Invalid token." });
      }

      // Store the decoded userId in req object for further use
      req.userId = decoded.id;

      // Optionally, verify if the user exists in the database
      try {
        const user = await User.findByPk(decoded.id);
        if (!user) {
          return res.status(404).json({ message: "User not found!" });
        }
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error verifying user in the database." });
      }

      next(); // Proceed to the next middleware or route handler
    }
  );
};
