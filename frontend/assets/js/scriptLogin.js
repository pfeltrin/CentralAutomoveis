document.addEventListener("DOMContentLoaded", async () => {
    const loginArea = document.getElementById("loginArea");
    const setupArea = document.getElementById("setupArea");
    const loginForm = document.getElementById("loginForm");
    const setupForm = document.getElementById("setupForm");
    const msgErro = document.getElementById("msgErro");
    const msgSetup = document.getElementById("msgSetup");

    try {
        const res = await fetch("/auth/status", { credentials: "same-origin" });
        if (!res.ok) throw new Error("Falha ao verificar configuração");
        const data = await res.json();

        if (data.precisaConfigurar) {
            setupArea.hidden = false;
        } else {
            loginArea.hidden = false;
        }
    } catch (err) {
        console.error(err);
        loginArea.hidden = false;
        msgErro.textContent = "Erro ao iniciar o sistema";
    }

    setupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        msgSetup.textContent = "";

        const nome = document.getElementById("setupNome").value.trim();
        const email = document.getElementById("setupEmail").value.trim();
        const senha = document.getElementById("setupSenha").value;
        const confirmacao = document.getElementById("setupSenhaConfirmacao").value;

        if (senha !== confirmacao) {
            msgSetup.textContent = "As senhas não coincidem";
            return;
        }

        try {
            const res = await fetch("/auth/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ nome, email, senha })
            });

            const data = await res.json();
            if (!res.ok) {
                msgSetup.textContent = data.erro || "Não foi possível criar o acesso";
                return;
            }

            window.location.href = "/";
        } catch (err) {
            console.error(err);
            msgSetup.textContent = "Erro ao conectar com o servidor";
        }
    });

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        msgErro.textContent = "";

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;

        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ email, senha })
            });

            const data = await res.json();
            if (!res.ok) {
                msgErro.textContent = data.erro || "Login inválido";
                return;
            }

            window.location.href = "/";
        } catch (err) {
            console.error(err);
            msgErro.textContent = "Erro ao conectar com o servidor";
        }
    });
});
