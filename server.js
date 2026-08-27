// server.js — versão final para SQLite (compatível com instalador)
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const os = require("os");
const fs = require("fs");

const { db, backupDB } = require("./database/db");

const app = express();

// ====== ROTAS API ======
const veiculosRoutes = require("./backend/src/routes/veiculos");
const veiculosVendidosRoutes = require("./backend/src/routes/veiculosVendidos");
const vendasRoutes = require("./backend/src/routes/vendas");
const relatorioRouter = require("./backend/src/routes/relatorio");

// ====== MIDDLEWARES ======
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "20mb" }));

// ====== PASTA DE DADOS DO USUÁRIO ======
const userDataPath = path.join(os.homedir(), "AppData", "Roaming", "Central Automoveis");
if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });
console.log("📁 Pasta de dados para banco, sessões e uploads:", userDataPath);

// ====== PASTA DE UPLOADS ======
const uploadsPath = path.join(userDataPath, "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use("/uploads", express.static(uploadsPath));

// ====== SESSÃO ======
app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: userDataPath, // sessions na pasta de dados do usuário
    }),
    secret: process.env.SESSION_SECRET || "segredo_super_forte",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // coloque true se usar HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 4, // 4 horas
    },
  })
);

// ====== AUTENTICAÇÃO ======
function auth(req, res, next) {
  if (!req.session.usuario) return res.redirect("/login");
  next();
}

function authApi(req, res, next) {
  if (!req.session.usuario) return res.status(401).json({ erro: "Não autorizado" });
  next();
}

// ====== LOGIN ======
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await db.getAsync("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (!usuario) return res.status(401).json({ erro: "Usuário não encontrado" });
    if (senha !== usuario.senha) return res.status(401).json({ erro: "Senha inválida" });

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };

    res.json({ sucesso: true });
  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).json({ erro: "Erro no login" });
  }
});

// ====== LOGOUT ======
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Erro ao destruir sessão:", err);
    res.clearCookie("connect.sid");
    res.json({ sucesso: true });
  });
});

// ====== FRONTEND ======
const frontPath = path.join(__dirname, "frontend");
app.use("/assets", express.static(path.join(frontPath, "assets")));

app.get("/login", (req, res) => res.sendFile(path.join(frontPath, "pages/login.html")));
app.get("/", auth, (req, res) => res.sendFile(path.join(frontPath, "pages/index.html")));
app.get("/estoque", auth, (req, res) => res.sendFile(path.join(frontPath, "pages/estoque.html")));
app.get("/relatorios", auth, (req, res) => res.sendFile(path.join(frontPath, "pages/relatorios.html")));
app.get("/vendidos", auth, (req, res) => res.sendFile(path.join(frontPath, "pages/vendidos.html")));
app.get("/cadastro", auth, (req, res) => res.sendFile(path.join(frontPath, "pages/cadastro.html")));

// ====== API ======
app.use("/veiculos", authApi, veiculosRoutes);
app.use("/veiculosVendidos", authApi, veiculosVendidosRoutes);
app.use("/vendas", authApi, vendasRoutes);
app.use("/relatorio", authApi, relatorioRouter);

// ====== TESTE SQLITE ======
(async () => {
  try {
    const teste = await db.getAsync("SELECT datetime('now') as agora");
    console.log("✅ SQLite funcionando. Data/hora agora:", teste.agora);
  } catch (err) {
    console.error("❌ Erro SQLite:", err);
  }
})();

// ====== BACKUP AUTOMÁTICO ======
backupDB();

// ====== START ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));