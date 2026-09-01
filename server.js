// server.js — SQLite local + Electron
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const fs = require("fs");
const crypto = require("crypto");

const { db, dbReady, backupDB, userDataPath } = require("./database/db");

const app = express();

const veiculosRoutes = require("./backend/src/routes/veiculos");
const veiculosVendidosRoutes = require("./backend/src/routes/veiculosVendidos");
const vendasRoutes = require("./backend/src/routes/vendas");
const relatorioRouter = require("./backend/src/routes/relatorio");

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    // O frontend é servido pelo próprio Express. Requisições sem Origin são
    // permitidas para compatibilidade com navegação local do Electron.
    if (!origin || origin === "http://127.0.0.1:3000" || origin === "http://localhost:3000") {
      return callback(null, true);
    }
    return callback(new Error("Origem não permitida"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "20mb" }));

const uploadsPath = path.join(userDataPath, "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use("/uploads", express.static(uploadsPath));

function getSessionSecret() {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32) {
    return process.env.SESSION_SECRET;
  }

  const secretPath = path.join(userDataPath, ".session-secret");

  if (fs.existsSync(secretPath)) {
    const saved = fs.readFileSync(secretPath, "utf8").trim();
    if (saved.length >= 32) return saved;
  }

  const generated = crypto.randomBytes(48).toString("hex");
  fs.writeFileSync(secretPath, generated, { encoding: "utf8", mode: 0o600 });
  return generated;
}

app.use(
  session({
    store: new SQLiteStore({ db: "sessions.sqlite", dir: userDataPath }),
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    name: "central.sid",
    cookie: {
      secure: false, // localhost HTTP dentro do Electron
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 4,
    },
  })
);

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function verifyPassword(password, stored) {
  try {
    const [algorithm, saltHex, hashHex] = String(stored || "").split("$");
    if (algorithm !== "scrypt" || !saltHex || !hashHex) return false;

    const expected = Buffer.from(hashHex, "hex");
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function auth(req, res, next) {
  if (!req.session.usuario) return res.redirect("/login");
  next();
}

function authApi(req, res, next) {
  if (!req.session.usuario) return res.status(401).json({ erro: "Não autorizado" });
  next();
}

// Informa ao frontend se esta é uma instalação nova, sem administrador.
app.get("/auth/status", async (req, res) => {
  try {
    await dbReady;
    const row = await db.getAsync("SELECT COUNT(*) AS total FROM usuarios");
    res.json({ precisaConfigurar: Number(row.total) === 0 });
  } catch (err) {
    console.error("❌ Erro ao verificar configuração:", err);
    res.status(500).json({ erro: "Erro ao verificar configuração" });
  }
});

// Só permite criar o primeiro administrador quando ainda não existe usuário.
app.post("/auth/setup", async (req, res) => {
  try {
    await dbReady;
    const row = await db.getAsync("SELECT COUNT(*) AS total FROM usuarios");
    if (Number(row.total) !== 0) {
      return res.status(403).json({ erro: "Configuração inicial já realizada" });
    }

    const nome = String(req.body.nome || "").trim();
    const email = normalizeEmail(req.body.email);
    const senha = req.body.senha;

    if (nome.length < 2 || nome.length > 80) {
      return res.status(400).json({ erro: "Informe um nome válido" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ erro: "Informe um e-mail válido" });
    }
    if (!validatePassword(senha)) {
      return res.status(400).json({ erro: "A senha deve ter entre 8 e 128 caracteres" });
    }

    const senhaHash = hashPassword(senha);
    const result = await db.runAsync(
      "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, senhaHash]
    );

    req.session.regenerate((err) => {
      if (err) {
        console.error("❌ Erro ao iniciar sessão:", err);
        return res.status(500).json({ erro: "Erro ao iniciar sessão" });
      }
      req.session.usuario = { id: result.id, nome, email };
      res.status(201).json({ sucesso: true });
    });
  } catch (err) {
    console.error("❌ Erro na configuração inicial:", err);
    res.status(500).json({ erro: "Erro na configuração inicial" });
  }
});

app.post("/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const senha = req.body.senha;

  if (!email || typeof senha !== "string") {
    return res.status(400).json({ erro: "Credenciais inválidas" });
  }

  try {
    await dbReady;
    const usuario = await db.getAsync("SELECT * FROM usuarios WHERE email = ?", [email]);

    // Mensagem única evita revelar se determinado e-mail existe no banco.
    if (!usuario || !verifyPassword(senha, usuario.senha)) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos" });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error("❌ Erro ao regenerar sessão:", err);
        return res.status(500).json({ erro: "Erro no login" });
      }

      req.session.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email };
      res.json({ sucesso: true });
    });
  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).json({ erro: "Erro no login" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao destruir sessão:", err);
      return res.status(500).json({ erro: "Erro ao sair" });
    }
    res.clearCookie("central.sid");
    res.json({ sucesso: true });
  });
});

const frontPath = path.join(__dirname, "frontend");
app.use("/assets", express.static(path.join(frontPath, "assets")));

app.get("/login", (req, res) => res.sendFile(path.join(frontPath, "pages/login.html")));
app.get("/", auth, (req, res) => res.sendFile(path.join(frontPath, "pages/index.html")));
app.get("/estoque", auth, (req, res) => res.sendFile(path.join(frontPath, "pages/estoque.html")));
app.get("/relatorios", auth, (req, res) => res.sendFile(path.join(frontPath, "pages/relatorios.html")));
app.get("/vendidos", auth, (req, res) => res.sendFile(path.join(frontPath, "pages/vendidos.html")));
app.get("/cadastro", auth, (req, res) => res.sendFile(path.join(frontPath, "pages/cadastro.html")));

app.use("/veiculos", authApi, veiculosRoutes);
app.use("/veiculosVendidos", authApi, veiculosVendidosRoutes);
app.use("/vendas", authApi, vendasRoutes);
app.use("/relatorio", authApi, relatorioRouter);

(async () => {
  try {
    await dbReady;
    const teste = await db.getAsync("SELECT datetime('now') as agora");
    console.log("✅ SQLite funcionando. Data/hora agora:", teste.agora);
    backupDB();
  } catch (err) {
    console.error("❌ Falha ao preparar SQLite:", err);
  }
})();

const PORT = Number(process.env.PORT) || 3000;
const HOST = "127.0.0.1";
app.listen(PORT, HOST, () => console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`));
