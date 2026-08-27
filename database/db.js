// database/db.js — versão corrigida e estável para Electron + SQLite

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const os = require("os");

// pasta de dados do usuário
const userDataPath = path.join(os.homedir(), "AppData", "Roaming", "Central Automoveis");

// criar pasta se não existir
if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
    console.log("📁 Pasta criada:", userDataPath);
}

// caminho do banco
const dbPath = path.join(userDataPath, "database.db");
console.log("🗄️ Banco em:", dbPath);

// conexão
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Erro ao conectar SQLite:", err);
    } else {
        console.log("✅ SQLite conectado");
    }
});

// ativar foreign keys
db.run("PRAGMA foreign_keys = ON");

// ------------------
// PROMISE WRAPPERS
// ------------------

db.runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                console.error("❌ SQL run erro:", err);
                reject(err);
            } else {
                resolve({
                    id: this.lastID,
                    changes: this.changes
                });
            }
        });
    });
};

db.getAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error("❌ SQL get erro:", err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

db.allAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// ------------------
// CRIAR TABELAS
// ------------------

async function initDB() {
    try {

        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL
            )
        `);

        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS veiculos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                marca TEXT,
                modelo TEXT,
                ano INTEGER,
                placa TEXT UNIQUE,
                cor TEXT,
                cambio TEXT,
                valor REAL,
                foto TEXT,
                vendido INTEGER DEFAULT 0
            )
        `);

        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS vendas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                veiculo_id INTEGER NOT NULL,
                valor REAL NOT NULL,
                data TEXT NOT NULL,
                FOREIGN KEY(veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE
            )
        `);

        console.log("✅ Tabelas verificadas");

        // criar admin
        const admin = await db.getAsync(
            "SELECT * FROM usuarios WHERE email = ?",
            ["central@central.com"]
        );

        if (!admin) {

            await db.runAsync(
                "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
                ["Administrador", "central@central.com", "081198"]
            );

            console.log("✅ Admin criado");
        }

    } catch (err) {
        console.error("❌ Erro ao iniciar DB:", err);
    }
}

// iniciar banco
initDB();

// ------------------
// BACKUP
// ------------------

function backupDB() {

    const backupPath = path.join(
        userDataPath,
        `backup_${Date.now()}.db`
    );

    fs.copyFile(dbPath, backupPath, (err) => {

        if (err) {
            console.error("❌ erro backup:", err);
        } else {
            console.log("💾 backup criado:", backupPath);
        }

    });

}

module.exports = { db, backupDB };