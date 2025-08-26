const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
require("dotenv").config();
const fsPromises = require("fs").promises;
const path = require("path");

// Mock database for users
const usersDB = {
  users: require("../data/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Find the user
    const foundUser = usersDB.users.find((user) => user.username === username);
    if (!foundUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create JWT token
    const accessToken = jwt.sign(
      { username: foundUser.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    //create refresh token
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Save the refresh token in the user's data
    const otherUsers = usersDB.users.filter(
      (user) => user.username !== foundUser.username
    );
    const currentUser = {
      ...foundUser,
      refreshToken,
    };
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
      path.join(__dirname, "../data/users.json"),
      JSON.stringify(usersDB.users)
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ accessToken });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { handleLogin };
