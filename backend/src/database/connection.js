require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Log de erro do pool
pool.on("error", (err) => {
  console.error("❌ Erro inesperado no PostgreSQL:", err.message);
});

// Função de query
async function query(text, params) {
  return pool.query(text, params);
}

// Teste de conexão
(async () => {
  try {
    const r = await pool.query("SELECT 1");
    console.log("✅ PostgreSQL conectado no Render");
  } catch (err) {
    console.error("❌ Falha ao conectar no PostgreSQL:", err.message);
  }
})();

module.exports = {
  query,
  pool
};