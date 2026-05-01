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
app.post("/assign", async (req, res) => {
  const { employee_id, date, shift, type } = req.body;

  try {
    await pool.query(
      `INSERT INTO assignments (employee_id, work_date, shift_id, type_id)
       VALUES ($1, $2,
         (SELECT id FROM shifts WHERE code=$3),
         (SELECT id FROM assignment_types WHERE code=$4)
       )
       ON CONFLICT (employee_id, work_date, shift_id)
       DO UPDATE SET type_id =
         (SELECT id FROM assignment_types WHERE code=$4)
      `,
      [employee_id, date, shift, type],
    );
    console.log("Saved");
    res.send("Saved to DB ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error ❌");
  }
});

app.get("/assignments", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        e.name as employee,
        a.work_date,
        s.code as shift,
        t.code as type
      FROM assignments a
      JOIN employees e ON e.id = a.employee_id
      JOIN shifts s ON s.id = a.shift_id
      JOIN assignment_types t ON t.id = a.type_id
      ORDER BY a.work_date DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data");
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://localhost:3000");
});
