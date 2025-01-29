const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔹 เชื่อมต่อฐานข้อมูล MySQL ผ่าน Environment Variables
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// 🟢 API: ดึงข้อมูลลูกค้าด้วย LINE ID
app.get("/api/customer", (req, res) => {
  const { line_id } = req.query;
  console.log("🔍 Received request for line_id:", line_id);

  if (!line_id) {
    console.log("⚠️ Error: Missing line_id");
    return res.status(400).json({ status: "error", message: "Missing line_id" });
  }

  const query = "SELECT * FROM customers WHERE line_id = ?";
  db.query(query, [line_id], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ status: "error", message: "Database query failed" });
    }

    if (results.length > 0) {
      console.log("✅ Customer found:", results[0]);
      res.json({ status: "found", customer: results[0] });
    } else {
      console.log("⚠️ Customer not found");
      res.json({ status: "not_found" });
    }
  });
});

// 🟢 API: บันทึกข้อมูลลูกค้าใหม่
app.post("/api/customer", (req, res) => {
  console.log("📩 Received POST request:", req.body);
  const { line_id, nickname, first_name, last_name, birth_date, gender, phone, email } = req.body;

  if (!line_id || !nickname || !first_name || !last_name || !birth_date || !gender || !phone || !email) {
    console.log("⚠️ Error: Missing required fields");
    return res.status(400).json({ status: "error", message: "Missing required fields" });
  }

  const query = `
    INSERT INTO customers (line_id, nickname, first_name, last_name, birth_date, gender, phone, email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [line_id, nickname, first_name, last_name, birth_date, gender, phone, email], (err) => {
    if (err) {
      console.error("❌ Database insertion failed:", err);
      return res.status(500).json({ status: "error", message: "Database insertion failed" });
    }

    console.log("✅ Customer added successfully");
    res.json({ status: "success", message: "Customer added successfully" });
  });
});

// 🟢 ตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่
app.get("/", (req, res) => {
  res.send("✅ Server is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
