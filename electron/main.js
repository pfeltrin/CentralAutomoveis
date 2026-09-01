const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");

let mainWindow;

function startServer() {
    try {
        const serverPath = path.join(app.getAppPath(), "server.js");
        require(serverPath);
        console.log("✅ Servidor rodando de:", serverPath);
    } catch (error) {
        console.error("❌ Falha crítica ao iniciar backend:", error);
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(app.getAppPath(), "build", "icon.ico"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            spellcheck: false,
            backgroundThrottling: false
        }
    });

    mainWindow.webContents.on("will-navigate", (event, url) => {
        try {
            const target = new URL(url);
            if (target.hostname !== "127.0.0.1" || target.port !== "3000") {
                event.preventDefault();
            }
        } catch {
            event.preventDefault();
        }
    });

    mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

    mainWindow.webContents.on("before-input-event", (event, input) => {
        if (input.type === "keyDown" && !input.control && !input.alt && !input.meta) {
            mainWindow.webContents.setIgnoreMenuShortcuts(true);
        } else {
            mainWindow.webContents.setIgnoreMenuShortcuts(false);
        }
    });

    mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.focus();
        mainWindow.webContents.focus();
        setTimeout(() => {
            if (mainWindow) {
                mainWindow.focus();
                mainWindow.webContents.focus();
            }
        }, 300);
    });

    const loginUrl = "http://127.0.0.1:3000/login";
    mainWindow.loadURL(loginUrl).catch(() => {
        console.log("Servidor ainda não respondeu, tentando recarregar...");
        setTimeout(() => {
            if (mainWindow) mainWindow.loadURL(loginUrl);
        }, 1000);
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    startServer();
    setTimeout(createWindow, 1500);

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
    try {
        globalShortcut.unregisterAll();
    } catch (e) {}
});
