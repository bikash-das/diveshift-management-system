require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

/**
 * 1. DATABASE CONFIGURATION & RESILIENCY
 */
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

let pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

/**
 * 2. AUTOMATIC RETRY WRAPPER
 */
const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    if (
      err.message.includes("terminated unexpectedly") ||
      err.message.includes("Connection terminated")
    ) {
      console.warn("Retrying query due to unexpected termination...");
      return await pool.query(text, params);
    }
    throw err;
  }
};

const app = express();
app.use(cors());
app.use(express.json());

/**
 * 3. MIDDLEWARE
 */
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tenantId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

/**
 * 4. ROUTES
 */

// --- AUTHENTICATION ---
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await query("SELECT * FROM tenants WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0)
      return res.status(400).json({ msg: "Invalid credentials" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token, tenant: { id: user.id, name: user.name } });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
});

// --- EMPLOYEE MANAGEMENT ---
app.get("/employee/:tenantId", auth, async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM employees WHERE tenant_id=$1 ORDER BY name ASC",
      [req.params.tenantId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching employees" });
  }
});

app.post("/employee", auth, async (req, res) => {
  const { name, position, tenant_id } = req.body;
  try {
    const result = await query(
      "INSERT INTO employees (name, position, tenant_id) VALUES ($1, $2, $3) RETURNING *",
      [name, position || "Staff", tenant_id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

app.delete("/employee/:id", auth, async (req, res) => {
  try {
    await query("DELETE FROM employees WHERE id = $1", [req.params.id]);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting employee" });
  }
});

// --- SHIFT LOGGING ---
app.post("/log", auth, async (req, res) => {
  const { employee_id, date, shift, activity, tenant_id } = req.body;
  try {
    const checkDuplicate = await query(
      "SELECT id FROM logs WHERE employee_id = $1 AND work_date = $2 AND shift = $3",
      [employee_id, date, shift],
    );

    if (checkDuplicate.rows.length > 0) {
      return res.status(400).json({ msg: "Shift already logged." });
    }

    await query(
      "INSERT INTO logs (employee_id, work_date, shift, activity, tenant_id) VALUES ($1, $2, $3, $4, $5)",
      [employee_id, date, shift, activity, tenant_id],
    );
    res.json({ msg: "Saved" });
  } catch (err) {
    res.status(500).json({ msg: "Error saving log" });
  }
});

app.get("/logs/:tenantId", auth, async (req, res) => {
  try {
    const result = await query(
      `SELECT l.id, e.name as employee_name, l.work_date, l.shift, l.activity
       FROM logs l
       JOIN employees e ON e.id = l.employee_id
       WHERE l.tenant_id=$1
       ORDER BY l.work_date DESC, l.id DESC`,
      [req.params.tenantId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching logs" });
  }
});

app.delete("/log/:id", auth, async (req, res) => {
  try {
    await query("DELETE FROM logs WHERE id = $1", [req.params.id]);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting log" });
  }
});

// --- REPORTING ---
app.get("/reports/detailed/:tenantId", auth, async (req, res) => {
  const { tenantId } = req.params;
  const { month, year } = req.query;
  try {
    const result = await query(
      `SELECT 
         e.name,
         COALESCE(SUM(CASE WHEN l.activity IN ('DC', 'SNK') AND EXTRACT(DOW FROM l.work_date) != 5 THEN 0.5 ELSE 0 END), 0) AS normal_days,
         COALESCE(SUM(CASE WHEN l.activity IN ('DC', 'SNK') AND EXTRACT(DOW FROM l.work_date) = 5 THEN 0.5 ELSE 0 END), 0) AS fridays,
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
    res.status(500).json({ msg: "Error generating report" });
  }
});

/**
 * 5. SERVER INITIALIZATION
 */
const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
