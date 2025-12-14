// server.js — VERSÃO FINAL CORRETA

require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcrypt");

const app = express();

// ====== CONEXÃO POSTGRES ======
const db = require("./backend/src/database/connection");

// ====== ROTAS API ======
const veiculosRoutes = require("./backend/src/routes/veiculos");
const veiculosVendidosRoutes = require("./backend/src/routes/veiculosVendidos");
const vendasRoutes = require("./backend/src/routes/vendas");
const relatorioRouter = require("./backend/src/routes/relatorio");

// ====== MIDDLEWARES ======
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json({ limit: "20mb" }));

// ====== SESSÃO ======
app.use(session({
    store: new pgSession({
        pool: db,
        tableName: "session"
    }),
    secret: process.env.SESSION_SECRET || "segredo_super_forte",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production", // ✔ Render usa HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 4 // 4h
    }
}));

// ====== AUTH ======
function auth(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }
    next();
}

// ====== LOGIN ======
app.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await db.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({ erro: "Usuário não encontrado" });
        }

        const usuario = result.rows[0];
        const senhaOk = await bcrypt.compare(senha, usuario.senha);

        if (!senhaOk) {
            return res.status(401).json({ erro: "Senha inválida" });
        }

        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        res.json({ sucesso: true });

    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ erro: "Erro no login" });
    }
});

// ====== LOGOUT ======
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ sucesso: true });
    });
});

// ====== FRONTEND ======
const frontPath = path.join(__dirname, "frontend");

app.use("/assets", express.static(path.join(frontPath, "assets")));
app.use("/uploads", express.static(path.join(__dirname, "backend/uploads")));

// 🔓 LOGIN NÃO PROTEGIDO
app.get("/login", (req, res) => {
    res.sendFile(path.join(frontPath, "pages", "login.html"));
});

// 🔐 ROTAS PROTEGIDAS
app.get("/", auth, (req, res) => {
    res.sendFile(path.join(frontPath, "pages", "index.html"));
});

app.get("/cadastro", auth, (req, res) => {
    res.sendFile(path.join(frontPath, "pages", "cadastro.html"));
});

app.get("/estoque", auth, (req, res) => {
    res.sendFile(path.join(frontPath, "pages", "estoque.html"));
});

app.get("/relatorios", auth, (req, res) => {
    res.sendFile(path.join(frontPath, "pages", "relatorios.html"));
});

app.get("/vendidos", auth, (req, res) => {
    res.sendFile(path.join(frontPath, "pages", "vendidos.html"));
});

function authApi(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({ erro: "Não autorizado" });
    }
    next();
}

// ====== API ======
app.use("/veiculos", authApi, veiculosRoutes);
app.use("/veiculosVendidos", authApi, veiculosVendidosRoutes);
app.use("/vendas", authApi, vendasRoutes);
app.use("/relatorio", authApi, relatorioRouter);

// ====== TESTE POSTGRES ======
(async () => {
    try {
        const result = await db.query("SELECT NOW()");
        console.log("✅ PostgreSQL conectado:", result.rows[0].now);
    } catch (err) {
        console.error("❌ Erro PostgreSQL:", err);
    }
})();

// ====== START ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
