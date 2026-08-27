require("dotenv").config();
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on("error", (err) => {
  console.error("🔥 Erro inesperado no PostgreSQL:", err);
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } catch (err) {
    console.error("❌ Erro SQL:", err.message, "Query:", text);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { query, pool };
