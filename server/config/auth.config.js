require("dotenv").config();

module.exports = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiration: 900, // 15 minutes
  jwtRefreshExpiration: 604800, // 7 days
};
