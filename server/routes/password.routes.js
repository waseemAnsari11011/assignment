const express = require("express");
const password = require("../controllers/password.controller");

module.exports = (app) => {
  const router = express.Router();

  //forget-password
  router.post("/forgot-password", password.forgotPassword);
  router.post("/reset-password", password.resetPassword);

  app.use("/api/users", router);
};
