document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // MUITO IMPORTANTE
        body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (res.ok && data.sucesso) {
        window.location.href = "/"; // 🔥 REDIRECIONA
    } if (document.referrer && document.referrer.includes("/login")) {
    history.replaceState(null, "", "/");
    } else {
        alert(data.erro || "Erro no login");
    }

});