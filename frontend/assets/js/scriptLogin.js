document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const msg = document.getElementById("msgErro");

    if (!form) {
        console.error("❌ Formulário de login não encontrado");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        msg.textContent = "";

        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await res.json();

            if (!res.ok) {
                msg.textContent = data.erro || "Login inválido";
                return;
            }

            // ✅ LOGIN OK
            window.location.href = "/";

        } catch (err) {
            console.error("Erro no login:", err);
            msg.textContent = "Erro ao conectar com o servidor";
        }
    });
});
