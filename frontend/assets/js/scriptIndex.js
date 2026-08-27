// scriptIndex.js

const btnCadastrar = document.getElementById("btnCadastrar");
if (btnCadastrar) {
    btnCadastrar.addEventListener("click", () => {
        window.location.href = "/cadastro";
    });
}

const btnEstoque = document.getElementById("btnEstoque");
if (btnEstoque) {
    btnEstoque.addEventListener("click", () => {
        window.location.href = "/estoque";
    });
}

const btnRelatorios = document.getElementById("btnRelatorios");
if (btnRelatorios) {
    btnRelatorios.addEventListener("click", () => {
        window.location.href = "/relatorios";
    });
}

const btnVendidos = document.getElementById("btnVendidos");
if (btnVendidos) {
    btnVendidos.addEventListener("click", () => {
        window.location.href = "/vendidos";
    });
}