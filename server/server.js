const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // <-- added
const mysql = require("mysql2/promise");
const dbConfig = require("./config/db.config");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const app = express();

console.log("process.env.FRONTEND_URL: ", process.env.FRONTEND_URL);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use cookie-parser middleware
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allow cookies to be sent
  })
);

app.use(bodyParser.json());

// Ensure the uploads directory exists
const uploadsDir = path.join("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log(`Created uploads directory at ${uploadsDir}`);
}

async function createDatabaseIfNotExists() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.DB}\`;`);
    console.log(`Database '${dbConfig.DB}' checked/created.`);
    await connection.end();
  } catch (err) {
    console.error("Could not create database:", err);
    process.exit(1);
  }
}

async function startServer() {
  await createDatabaseIfNotExists();

  const db = require("./models");

  // Uncomment if you want to auto-sync models:
  // db.sequelize.sync({ alter: true }).then(() => {
  //   console.log("Database synced with the model changes.");
  // });

  require("./routes/user.routes")(app);
  require("./routes/auth.routes")(app);
  require("./routes/password.routes")(app);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
