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

/**
 * TENANT AUTHENTICATION
 */

// Login - Returns tenant info
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT id, username FROM tenants WHERE username=$1 AND password=$2",
      [username, password],
    );

    if (result.rows.length > 0) {
      console.log("Tenant logged in: ", username);
      res.json(result.rows[0]);
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
});

// Signup - Creates new tenant
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await pool.query(
      "SELECT * FROM tenants WHERE username=$1",
      [username],
    );
    if (existing.rows.length > 0) {
      return res.status(400).send("Tenant already exists");
    }

    const result = await pool.query(
      "INSERT INTO tenants (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, password],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Signup error");
  }
});

/**
 * EMPLOYEE MANAGEMENT
 */

// Get all employees for a tenant (sorted alphabetically)
app.get("/employee/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM employees WHERE tenant_id=$1 ORDER BY name ASC",
      [tenantId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching employees");
  }
});

// Add new employee
app.post("/employee", async (req, res) => {
  const { name, phone, address, tenant_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO employees (name, phone, address, tenant_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, phone, address, tenant_id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding employee");
  }
});

// Delete employee
app.delete("/employee/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM employees WHERE id = $1", [id]);
    res.send("Deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting employee");
  }
});

/**
 * SHIFT LOGGING
 */

// Save a shift log (0.5 logic handled by reporting)
app.post("/log", async (req, res) => {
  const { employee_id, date, shift, activity, tenant_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO logs (employee_id, work_date, shift, activity, tenant_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [employee_id, date, shift, activity, tenant_id],
    );
    res.send("Saved");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving log");
  }
});

// Get recent logs for AddShift page (latest first, includes names)
app.get("/logs/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  try {
    const result = await pool.query(
      `SELECT l.id, e.name as employee_name, l.work_date, l.shift, l.activity
       FROM logs l
       JOIN employees e ON e.id = l.employee_id
       WHERE l.tenant_id=$1
       ORDER BY l.work_date DESC, l.id DESC`,
      [tenantId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching logs");
  }
});

// Delete a specific log entry
app.delete("/log/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM logs WHERE id = $1", [id]);
    res.send("Deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting log");
  }
});

/**
 * REPORTING (THE "BRAIN")
 */

// Generates monthly report based on 0.5 shift calculation
app.get("/reports/detailed/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  const { month, year } = req.query;

  try {
    const result = await pool.query(
      `SELECT 
         e.name,
         -- Sum 0.5 per shift entry for Normal Days (Mon-Thu, Sat-Sun)
         COALESCE(SUM(CASE WHEN l.activity IN ('DC', 'SNK') AND EXTRACT(DOW FROM l.work_date) != 5 THEN 0.5 ELSE 0 END), 0) AS normal_days,
         
         -- Sum 0.5 per shift entry for Fridays
         COALESCE(SUM(CASE WHEN l.activity IN ('DC', 'SNK') AND EXTRACT(DOW FROM l.work_date) = 5 THEN 0.5 ELSE 0 END), 0) AS fridays,
         
         -- Leave categories (assumed 0.5 per shift entry)
         COALESCE(SUM(CASE WHEN l.activity = 'SICK' THEN 0.5 ELSE 0 END), 0) AS sick_days,
         COALESCE(SUM(CASE WHEN l.activity = 'OFF' THEN 0.5 ELSE 0 END), 0) AS off_days,
         COALESCE(SUM(CASE WHEN l.activity = 'PH' THEN 0.5 ELSE 0 END), 0) AS public_holidays
       FROM employees e
       LEFT JOIN logs l ON e.id = l.employee_id 
         AND EXTRACT(MONTH FROM l.work_date) = $2 
         AND EXTRACT(YEAR FROM l.work_date) = $3
       WHERE e.tenant_id = $1
       GROUP BY e.id, e.name
       ORDER BY e.name ASC`,
      [tenantId, month, year],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating report");
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://localhost:3000");
});
