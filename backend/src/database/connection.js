// connection.js (PostgreSQL - Render Compatibility)

require("dotenv").config();
const { Pool } = require("pg");

// -----------------------------
// 🛠 CONFIGURAÇÃO DO POOL
// -----------------------------
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT),
  max: 10,
  idleTimeoutMillis: 30000,

  // ⭐ OBRIGATÓRIO PARA Render
  ssl: {
    rejectUnauthorized: false
  }
});

// -----------------------------
// ❗ ERRO NO CLIENTE OCIOSO
// -----------------------------
pool.on("error", (err) => {
  console.error("Erro inesperado no cliente PostgreSQL:", err.message);
});

// -----------------------------
// 🔄 FUNÇÃO PADRÃO DE CONSULTA
// -----------------------------
async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error("Erro na query PostgreSQL:", err.message, "\nSQL:", text);
    throw err;
  }
}

// -----------------------------
// 🔌 TESTE AUTOMÁTICO DE CONEXÃO
// -----------------------------
(async () => {
  try {
    const r = await pool.query("SELECT NOW()");
    console.log("📌 PostgreSQL conectado com sucesso! →", r.rows[0].now);
  } catch (err) {
    console.error("❌ Falha ao conectar no PostgreSQL:", err.message);
  }
})();

module.exports = { query, pool };
