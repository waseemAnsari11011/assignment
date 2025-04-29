const express = require("express");
const auth = require("../controllers/auth.controller.js");
const upload = require("../middlewares/upload");

module.exports = (app) => {
  const router = express.Router();
  //login-register
  router.post("/register", upload.single("profileImage"), auth.register);
  router.get("/verify/:token", auth.verifyEmail);
  router.post("/login", auth.login);
  router.post("/refresh-token", auth.refreshToken);

  app.use("/api/users", router);
};
