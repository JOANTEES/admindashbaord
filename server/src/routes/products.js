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

// GET single product by ID (public route - no authentication required)
router.get("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        message: "Invalid product ID. Must be a number.",
      });
    }

    const result = await pool.query(
      "SELECT id, name, description, price, category, size, color, stock_quantity, image_url, created_at FROM products WHERE id = $1 AND is_active = true",
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product retrieved successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      message: "Server error while fetching product",
      error: error.message,
    });
  }
});

module.exports = router;
