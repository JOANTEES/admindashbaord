const express = require("express");
const { Pool } = require("pg");
const { adminAuth } = require("../middleware/auth");
require("dotenv").config();

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// GET all users (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, first_name, last_name, role, is_active, phone, department, last_login, created_at, updated_at FROM users ORDER BY created_at DESC"
    );

    res.json({
      message: "Users retrieved successfully",
      count: result.rows.length,
      users: result.rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Server error while fetching users",
      error: error.message,
    });
  }
});

// GET single user by ID (admin only)
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: "Invalid user ID. Must be a number.",
      });
    }

    const result = await pool.query(
      "SELECT id, email, first_name, last_name, role, is_active, phone, department, last_login, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User retrieved successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Server error while fetching user",
      error: error.message,
    });
  }
});

module.exports = router;
