import { compare } from "bcrypt";

import { sign } from "jsonwebtoken";
require("dotenv").config();
import { promises as fsPromises } from "fs";
import { join } from "path";

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
    const isPasswordValid = await compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create JWT token
    const accessToken = sign(
      { username: foundUser.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    //create refresh token
    const refreshToken = sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Save the refresh token in the user's data
    const otherUsers = users.filter(
      (user) => user.username !== foundUser.username
    );
    const currentUser = {
      ...foundUser,
      refreshToken,
    };
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
      join(__dirname, "../data/users.json"),
      JSON.stringify(users)
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

export default { handleLogin };
