import { Router } from "express";
import type { Request } from "express";
import { ResultSetHeader } from "mysql2";
import { pool } from "../database";
import { User } from "../interfaces";
import { authenticateToken } from "../middleware/auth-validation";
import {
  validateUserId,
  validateUserUpdate,
} from "../middleware/user-validation";

const router = Router();

// get users with pagination: /users?page=1&limit=10
router.get("/", async (req, res) => {
  try {
    // get pagination parameters with defaults if not provided
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    // calculate offset
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      "SELECT id, email FROM users LIMIT ? OFFSET ?",
      [limit, offset],
    );

    const users = rows as User[];

    res.json(users);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
});

// get single user by ID
router.get("/:id", validateUserId, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const [rows] = await pool.execute(
      "SELECT id, email FROM users WHERE id = ?",
      [userId],
    );

    const users = rows as User[];

    if (users.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const user = users[0];

    res.json(user);
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      error: "Failed to fetch user",
    });
  }
});

// update user
router.put(
  "/:id",
  authenticateToken,
  validateUserId,
  validateUserUpdate,
  async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { email } = req.body;

      // check if user is trying to update their own account
      if (req.user!.id !== userId) {
        return res.status(403).json({
          error: "Users can only update their own account",
        });
      }

      // update the user in the database
      const [result]: [ResultSetHeader, any] = await pool.execute(
        "UPDATE users SET email = ? WHERE id = ?",
        [email, userId],
      );

      // check if user was found and updated
      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const user: User = {
        id: userId,
        email,
      };
      res.json(user);
    } catch (error) {
      console.error("Database error:", error);

      res.status(500).json({
        error: "Failed to update user",
      });
    }
  },
);

// delete a user
router.delete("/:id", authenticateToken, validateUserId, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // check if user is trying to delete their own account
    if (req.user!.id !== userId) {
      return res.status(403).json({
        error: "Users can only delete their own account",
      });
    }

    const [result]: [ResultSetHeader, any] = await pool.execute(
      "DELETE FROM users WHERE id = ?",
      [userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // return 204 No Content - successful deletion with no response body
    res.status(204).send();
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      error: "Failed to delete user",
    });
  }
});

export default router;
