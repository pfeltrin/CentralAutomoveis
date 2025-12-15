// backend/src/database/connection.js

require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL conectado com sucesso");
});

pool.on("error", (err) => {
  console.error("🔥 Erro inesperado no PostgreSQL:", err);
  process.exit(1);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query
};
