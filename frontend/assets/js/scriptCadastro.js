// scriptCadastro.js

// --- BOTÃO VOLTAR AO MENU ---
const btnVoltar = document.getElementById("btnVoltar");
if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
        window.location.href = "/";
    });
}

// --- INPUTS PARA MAIÚSCULO ---
document.querySelectorAll(".toUpper").forEach(input => {
    input.addEventListener("input", function () {
        this.value = this.value.toUpperCase();
    });
});

// --- FORMATAÇÃO DO VALOR ---
const inputValor = document.getElementById("valor");

if (inputValor) {
    inputValor.addEventListener("input", function (e) {
        let value = e.target.value.replace(/\D/g, "");

        if (value === "") {
            e.target.value = "";
            return;
        }

        const valorFormatado = (parseInt(value) / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        e.target.value = valorFormatado;
    });
}

// --- SALVAR VEÍCULO VIA API ---
const btnSalvar = document.getElementById("btnSalvar");

if (btnSalvar) {
    btnSalvar.addEventListener("click", async function (event) {
        event.preventDefault();

        const marca = document.getElementById("marca").value.trim();
        const modelo = document.getElementById("modelo").value.trim();
        const ano = document.getElementById("ano").value.trim();
        const placa = document.getElementById("placa").value.trim();
        const cor = document.getElementById("cor").value.trim();
        const valorBr = document.getElementById("valor").value.trim();
        const cambio = document.getElementById("cambio").value.trim();
        const obs = document.getElementById("obs").value.trim();

        // --- Função segura para converter moeda para número ---
        function limparMoeda(valor) {
            if (!valor) return 0;
            const apenasNumeros = valor.replace(/\D/g, "");
            return Number(apenasNumeros) / 100;
        }

        const valorEmReais = limparMoeda(valorBr);

        if (!valorEmReais || valorEmReais <= 0) {
            alert("Informe o valor do veículo.");
            return;
        }

        const valor = valorEmReais; // envia em centavos

        // --- FOTO ---
        const fotoInput = document.getElementById("foto");
        const file = fotoInput.files[0];

        if (!file) {
            alert("Selecione uma imagem do veículo.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async function () {
            const base64 = reader.result;

            const novoVeiculo = {
                marca,
                modelo,
                ano,
                placa,
                cor,
                valor,
                cambio,
                obs,
                foto: base64
            };

            try {
                const res = await fetch("/veiculos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(novoVeiculo)
                });

                if (res.ok) {
                    alert("Veículo salvo com sucesso!");
                    document.getElementById("formCadastro").reset();
                } else {
                    alert("Erro ao salvar veículo.");
                }
            } catch (err) {
                console.error(err);
                alert("Erro de conexão com a API.");
            }
        };

        reader.readAsDataURL(file);
    });
}
