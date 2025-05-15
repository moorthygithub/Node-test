const { error } = require("console");
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.createProduct = async (req, res) => {
  const { Name, Description, Price, Stock, Category, Brand, Rating } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Images are required" });
  }

  if (!Name || !Description || !Price || !Rating) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const productInsertQuery = `
      INSERT INTO products ("Name", "Description", "Price", "Stock", "Category", "Brand", "Rating","Images")
      VALUES ($1, $2, $3, $4, $5, $6, $7,$8)
      RETURNING id
    `;
    const productValues = [
      Name,
      Description,
      Price,
      Stock || 0,
      Category || null,
      Brand || null,
      Rating,
      imageUrls,
    ];

    const productResult = await client.query(productInsertQuery, productValues);

    await client.query("COMMIT");
    res.status(201).json({
      message: "Product created successfully",
      // productResult,
      // images: imageUrls,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    req.files.forEach((file) => {
      const filePath = path.join(__dirname, "..", "uploads", file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", filePath);
      });
    });

    console.error("Error inserting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

exports.getProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.status(200).json({ product: result.rows });
  } catch (err) {
    console.error("❌ Error fetching data:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.updateProduct = async (req, res) => {
  const { Name, Description, Price, Stock, Category, Brand, Rating } = req.body;
  const { id: productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  if (!Name || !Description || !Price || !Rating) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const imageUrls = req.files?.length
    ? req.files.map((file) => `/uploads/${file.filename}`)
    : [];

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const oldImagesResult = await client.query(
      `SELECT "Images" FROM products WHERE id = $1`,
      [productId]
    );
    const oldImages = oldImagesResult.rows[0]?.Images || [];

    if (imageUrls.length > 0) {
      oldImages.forEach((url) => {
        const filePath = path.join(__dirname, "..", url);
        fs.unlink(filePath, (err) => {
          if (err) console.error("Failed to delete file:", filePath);
        });
      });
    }
    const updateQuery = `
      UPDATE products
      SET "Name" = $1, "Description" = $2, "Price" = $3, "Stock" = $4,
          "Category" = $5, "Brand" = $6, "Rating" = $7, "Images" = $8
      WHERE id = $9
    `;

    const updateValues = [
      Name,
      Description,
      Price,
      Stock || 0,
      Category || null,
      Brand || null,
      Rating,
      imageUrls.length > 0 ? imageUrls : oldImages,
      productId,
    ];

    await client.query(updateQuery, updateValues);

    await client.query("COMMIT");
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    // Delete newly uploaded files on failure
    if (req.files) {
      req.files.forEach((file) => {
        const filePath = path.join(__dirname, "..", "uploads", file.filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error("Failed to delete uploaded file:", filePath);
        });
      });
    }

    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};
exports.deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT "Images" FROM products WHERE id = $1`,
      [productId]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }

    const images = rows[0].Images || [];
    await client.query(`DELETE FROM products WHERE id = $1`, [productId]);

    images.forEach((imagePath) => {
      const fullPath = path.resolve(
        __dirname,
        "..",
        imagePath.replace(/^\/+/, "")
      );
      console.log("Deleting file at:", fullPath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error("Failed to delete image:", fullPath, err.message);
        } else {
          console.log("Deleted:", fullPath);
        }
      });
    });

    await client.query("COMMIT");
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};
