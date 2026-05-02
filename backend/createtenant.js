require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_JX7m3bUFGtTE@ep-green-scene-anxos8df-pooler.c-6.us-east-1.aws.neon.tech/divedb?sslmode=verify-full&channel_binding=require",
  ssl: { rejectUnauthorized: false },
});

// --- CONFIGURATION ---
const tenantName = "Blue Water Divers"; // Your business name
const tenantEmail = "admin@bluewater.com"; // Your login email
const plainPassword = "yourSecurePassword123"; // The password you want to use
// ---------------------

async function createTenant() {
  try {
    console.log("--- Starting Tenant Creation ---");

    // 1. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log("✅ Password hashed successfully.");

    // 2. Insert into Database
    const query = `
      INSERT INTO tenants (name, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, name, email;
    `;
    const values = [tenantName, tenantEmail, hashedPassword];

    const res = await pool.query(query, values);

    console.log("🚀 Tenant created successfully!");
    console.table(res.rows[0]);
    console.log("\nYou can now log in with these credentials.");
  } catch (err) {
    if (err.code === "23505") {
      console.error("❌ Error: A tenant with this email already exists.");
    } else {
      console.error("❌ Database Error:", err.message);
    }
  } finally {
    await pool.end();
  }
}

createTenant();
