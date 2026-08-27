const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");

let mainWindow;

// ==========================================
// 🚀 INICIAR SERVIDOR BACKEND
// ==========================================
function startServer() {
    try {
        const serverPath = path.join(app.getAppPath(), "server.js");

        require(serverPath);
        console.log("✅ Servidor rodando de:", serverPath);
    } catch (error) {
        console.error("❌ Falha crítica ao iniciar backend:", error);
    }
}
// =========================================
// 🖥️ CRIAR JANELA PRINCIPAL
// =========================================
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, "build/icon.ico"), // Garante o ícone na barra de tarefas
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false, 
            spellcheck: false, // Desativado para evitar travas de foco no Windows
            backgroundThrottling: false
        }
    });

    // SOLUÇÃO PARA O TECLADO: Prioriza a entrada de texto sobre os atalhos do sistema
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && !input.control && !input.alt && !input.meta) {
            mainWindow.webContents.setIgnoreMenuShortcuts(true);
        } else {
            mainWindow.webContents.setIgnoreMenuShortcuts(false);
        }
    });

    // ==========================================
    // 🎯 CORREÇÃO DE FOCO (resolve campos "travados"
    // ao abrir páginas ou modais - bug comum do
    // Electron no Windows)
    // ==========================================
    mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.focus();
    mainWindow.webContents.focus();

    setTimeout(() => {
        mainWindow.focus();
        mainWindow.webContents.focus();
    }, 300);
});

    // Carregar a URL inicial
    mainWindow.loadURL("http://localhost:3000/login").catch(() => {
        console.log("Servidor ainda não respondeu, tentando recarregar...");
        setTimeout(() => mainWindow.loadURL("http://localhost:3000/login"), 1000);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ==========================================
// ⚙️ CICLO DE VIDA DA APP
// ==========================================
app.whenReady().then(() => {
    startServer();

    // Pequeno delay para garantir que o Express subiu antes da janela abrir
    setTimeout(() => {
        createWindow();
    }, 1500);

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Limpeza e fechamento
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
    // Evita erros se o globalShortcut não estiver sendo usado
    try {
        globalShortcut.unregisterAll();
    } catch (e) {}
});