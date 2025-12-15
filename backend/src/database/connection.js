// backend/src/database/connection.js

require("dotenv").config();
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// 🔥 LOG DE ERRO GLOBAL
pool.on("error", (err) => {
  console.error("🔥 Erro inesperado no PostgreSQL:", err);
  process.exit(1);
});

// 🔄 FUNÇÃO DE QUERY
async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (err) {
    console.error("❌ Erro SQL:", err.message);
    console.error("➡️ Query:", text);
    throw err;
  } finally {
    client.release();
  }
}

// 🧪 TESTE DE CONEXÃO
(async () => {
  try {
    const r = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL conectado:", r.rows[0].now);
  } catch (err) {
    console.error("❌ Falha ao conectar no PostgreSQL:", err.message);
  }
})();

module.exports = {
  query,
  pool
};
