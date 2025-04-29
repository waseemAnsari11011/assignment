const db = require("../models");
const User = db.User;

// Middleware to check for duplicate email during registration
const checkDuplicateEmail = (req, res, next) => {
  // Check for duplicate email
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      // If user with this email exists, send an error response
      if (user) {
        // Important: Send a 400 status code for bad request (validation error)
        res.status(400).send({
          message: "Failed! Email is already in use!",
        });
        // Stop the request processing, do not call next()
        return;
      }
      // If email is unique, proceed to the next middleware (which will be Multer)
      next();
    })
    .catch((err) => {
      // Handle any database errors
      res.status(500).send({
        message: err.message || "Some error occurred while checking email.",
      });
    });
};

// Export the middleware function
const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail,
};

module.exports = verifySignUp;
