const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const pool = new Pool({
  user: "bikashdas",
  host: "localhost",
  database: "divedb",
  password: "password", // change if needed
  port: 5432,
});

const app = express();

app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query(
    "SELECT id, username FROM users WHERE username=$1 AND password=$2",
    [username, password],
  );

  if (result.rows.length > 0) {
    res.json(result.rows[0]);
  } else {
    res.status(401).send("Invalid");
  }
});

app.post("/employee", async (req, res) => {
  const { name, phone, address, user_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO employees (name, phone, address, user_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, phone, address, user_id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.get("/employees/:userId", async (req, res) => {
  const { userId } = req.params;

  const result = await pool.query("SELECT * FROM employees WHERE user_id=$1", [
    userId,
  ]);

  res.json(result.rows);
});

app.get("/employees/:userId", async (req, res) => {
  const { userId } = req.params;

  const result = await pool.query("SELECT * FROM employees WHERE user_id=$1", [
    userId,
  ]);

  res.json(result.rows);
});

app.get("/logs/:userId", async (req, res) => {
  const { userId } = req.params;

  const result = await pool.query(
    `SELECT l.id, e.name, l.work_date, l.shift, l.activity
     FROM logs l
     JOIN employees e ON e.id = l.employee_id
     WHERE l.user_id=$1
     ORDER BY l.work_date DESC`,
    [userId],
  );

  res.json(result.rows);
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM users WHERE username=$1", [
      username,
    ]);

    if (existing.rows.length > 0) {
      return res.status(400).send("User exists");
    }

    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, password],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://localhost:3000");
});
