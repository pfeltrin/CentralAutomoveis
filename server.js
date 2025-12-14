// server.js (versão para PostgreSQL)

const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();

// Rotas
const veiculosRoutes = require("./backend/src/routes/veiculos");
const veiculosVendidosRoutes = require("./backend/src/routes/veiculosVendidos");
const vendasRoutes = require("./backend/src/routes/vendas");
const relatorioRouter = require("./backend/src/routes/relatorio");

// Conexão PostgreSQL
const db = require("./backend/src/database/connection");

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ====== CAMINHO DO FRONTEND ======
const frontPath = path.join(__dirname, "frontend");

// ====== SERVIR ARQUIVOS ESTÁTICOS ======
app.use("/assets", express.static(path.join(frontPath, "assets")));
app.use("/uploads", express.static(path.join(__dirname, "backend/uploads")));

// ====== ROTAS DO FRONT-END ======
app.get("/", (req, res) => {
res.sendFile(path.join(frontPath, "pages", "index.html"));
});

app.get("/cadastro", (req, res) => {
res.sendFile(path.join(frontPath, "pages", "cadastro.html"));
});

app.get("/estoque", (req, res) => {
res.sendFile(path.join(frontPath, "pages", "estoque.html"));
});

app.get("/relatorios", (req, res) => {
res.sendFile(path.join(frontPath, "pages", "relatorios.html"));
});

app.get("/vendidos", (req, res) => {
res.sendFile(path.join(frontPath, "pages", "vendidos.html"));
});

// ====== ROTAS DA API ======
app.use("/veiculos", veiculosRoutes);
app.use("/veiculosVendidos", veiculosVendidosRoutes);
app.use("/vendas", vendasRoutes);
app.use("/relatorio", relatorioRouter);

// ====== TESTE DE CONEXÃO (PostgreSQL) ======
(async () => {
try {
const result = await db.query("SELECT NOW()");
console.log("✅ PostgreSQL conectado! Hora do servidor:", result.rows[0].now);
} catch (err) {
console.error("❌ Erro ao conectar ao PostgreSQL:", err);
}
})();

// ====== INICIAR SERVIDOR ======
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
