import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../database";
import { generateToken } from "../utils/jwt";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/auth-validation";
import { User, UserResponse } from "../interfaces";
import { ResultSetHeader } from "mysql2";

const router = Router();

// user registration
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user already exists
    const [rows] = await pool.execute("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    const existingUsers = rows as User[];

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    // hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // insert user into the database
    const [result]: [ResultSetHeader, any] = await pool.execute(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, hashedPassword],
    );

    // return user info (without password)
    const userResponse: UserResponse = {
      id: result.insertId,
      email,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      error: "Failed to register user",
    });
  }
});

// user login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const [rows] = await pool.execute(
      "SELECT id, email, password_hash FROM users WHERE email = ?",
      [email],
    );
    const users = rows as User[];

    const user = users[0];

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // verify password using bcrypt
    const validPassword = await bcrypt.compare(password, user.password_hash!);

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // generate JWT token
    const token = generateToken(user.id);

    // return user info (without password)
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
    };

    res.json({
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Failed to log in",
    });
  }
});

export default router;
