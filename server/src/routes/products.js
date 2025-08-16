const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// GET all products (public route - no authentication required)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, price, category, size, color, stock_quantity, image_url, created_at FROM products WHERE is_active = true ORDER BY created_at DESC"
    );

    res.json({
      message: "Products retrieved successfully",
      count: result.rows.length,
      products: result.rows,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Server error while fetching products",
      error: error.message,
    });
  }
});

module.exports = router;
