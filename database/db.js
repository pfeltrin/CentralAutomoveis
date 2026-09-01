// database/db.js — SQLite local para Electron

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const os = require("os");

// Dados persistentes ficam fora do repositório e do diretório de instalação.
const userDataPath = path.join(os.homedir(), "AppData", "Roaming", "Central Automoveis");

if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
    console.log("📁 Pasta criada:", userDataPath);
}

const dbPath = path.join(userDataPath, "database.db");
console.log("🗄️ Banco em:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Erro ao conectar SQLite:", err);
    } else {
        console.log("✅ SQLite conectado");
    }
});

db.run("PRAGMA foreign_keys = ON");

db.runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                console.error("❌ SQL run erro:", err);
                reject(err);
            } else {
                // Mantém ambos os nomes para compatibilidade com rotas existentes.
                resolve({ id: this.lastID, lastID: this.lastID, changes: this.changes });
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

db.allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

async function initDB() {
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

    // Versões antigas armazenavam senhas em texto puro. Para impedir que uma
    // credencial já exposta continue válida, contas sem hash scrypt são removidas.
    // Os dados de veículos e vendas não são afetados; o app solicitará a criação
    // de um novo administrador no próximo acesso.
    const legacyUsers = await db.allAsync(
        "SELECT id FROM usuarios WHERE senha NOT LIKE 'scrypt$%'"
    );

    if (legacyUsers.length > 0) {
        await db.runAsync("DELETE FROM usuarios WHERE senha NOT LIKE 'scrypt$%'");
        console.warn(`🔐 ${legacyUsers.length} conta(s) legada(s) removida(s). Crie um novo acesso seguro.`);
    }

    console.log("✅ Tabelas verificadas");
}

const dbReady = initDB().catch((err) => {
    console.error("❌ Erro ao iniciar DB:", err);
    throw err;
});

function backupDB() {
    const backupPath = path.join(userDataPath, `backup_${Date.now()}.db`);

    fs.copyFile(dbPath, backupPath, (err) => {
        if (err) {
            console.error("❌ Erro no backup:", err);
        } else {
            console.log("💾 Backup criado:", backupPath);
        }
    });
}

module.exports = { db, dbReady, backupDB, userDataPath };
