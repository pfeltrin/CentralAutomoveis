document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const msg = document.getElementById("msgErro");

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
        console.error(err);
        msg.textContent = "Erro ao conectar com o servidor";
    }
});
