module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true, // Ensures it's a valid email format
      },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    profileImage: DataTypes.STRING,
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user", // Default role is 'user'
      allowNull: false,
      validate: {
        isIn: [["admin", "user"]], // Validates that the role is either 'admin' or 'user'
      },
    },
  });

  return User;
};
