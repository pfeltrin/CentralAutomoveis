// === BOTÃO VOLTAR AO MENU ===
const btnVoltar = document.getElementById("btnVoltar");
if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
        window.location.href = "/";
    });
}

// === BUSCAR DADOS DO BACKEND ===
async function carregarRelatorio() {
    try {
        const res = await fetch("http://localhost:3000/relatorio");
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Erro ao carregar relatório:", err);
        return { estoque: [], vendidos: [] };
    }
}

// === FORMATAÇÃO DE VALOR BRL ===
function formatarValor(valor) {
    if (!valor) return "R$ 0,00";
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// === GERAR RELATÓRIO COMPLETO ===
document.getElementById("btnGerarRelatorio").addEventListener("click", async () => {
    const relatorio = await carregarRelatorio();
    const estoque = relatorio.estoque || [];
    const vendidos = relatorio.vendidos || [];
    const area = document.getElementById("relatorioConteudo");

    area.innerHTML = "";

    if (estoque.length === 0 && vendidos.length === 0) {
        area.innerHTML = "<p>Nenhum veículo encontrado.</p>";
        return;
    }

    let tabela = "";

    // === ESTOQUE ===
    tabela += `
        <h3 style="text-align:center; margin-top:20px;">VEÍCULOS EM ESTOQUE</h3>
        <table class="tabelaRelatorio">
            <thead>
                <tr>
                    <th>Imagem</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Ano</th>
                    <th>Placa</th>
                    <th>Cor</th>
                    <th>Valor</th>
                    <th>Câmbio</th>
                    <th>Observações</th>
                </tr>
            </thead>
            <tbody>
    `;

    estoque.forEach(v => {
        tabela += `
            <tr>
                <td><img src="${v.foto || '/assets/placeholder.png'}" class="fotoRelatorio"></td>
                <td>${v.marca}</td>
                <td>${v.modelo}</td>
                <td>${v.ano}</td>
                <td>${v.placa}</td>
                <td>${v.cor}</td>
                <td>${formatarValor(v.valor)}</td>
                <td>${v.cambio || ""}</td>
                <td>${v.obs || ""}</td>
            </tr>
        `;
    });

    tabela += `
            </tbody>
        </table>
    `;

    // === VENDIDOS ===
    tabela += `
        <h3 style="text-align:center; margin-top:40px;">VEÍCULOS VENDIDOS</h3>
        <table class="tabelaRelatorio">
            <thead>
                <tr>
                    <th>Imagem</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Ano</th>
                    <th>Placa</th>
                    <th>Cor</th>
                    <th>Valor</th>
                    <th>Câmbio</th>
                    <th>Observações</th>
                    <th>Data da Venda</th>
                </tr>
            </thead>
            <tbody>
    `;

    vendidos.forEach(v => {
        tabela += `
            <tr>
                <td><img src="${v.foto || '/assets/placeholder.png'}" class="fotoRelatorio"></td>
                <td>${v.marca}</td>
                <td>${v.modelo}</td>
                <td>${v.ano}</td>
                <td>${v.placa}</td>
                <td>${v.cor}</td>
                <td>${formatarValor(v.valor)}</td>
                <td>${v.cambio || ""}</td>
                <td>${v.obs || ""}</td>
                <td>${v.data_venda ? new Date(v.data_venda).toLocaleDateString("pt-BR") : ""}</td>
            </tr>
        `;
    });

    tabela += `
            </tbody>
        </table>
    `;

    area.innerHTML = tabela;
});

// === DOWNLOAD CSV ===
document.getElementById("btnDownloadCSV").addEventListener("click", async () => {
    const relatorio = await carregarRelatorio();
    const estoque = relatorio.estoque || [];
    const vendidos = relatorio.vendidos || [];

    if (estoque.length === 0 && vendidos.length === 0) {
        alert("Não há veículos para gerar o CSV.");
        return;
    }

    let csv = "STATUS;Marca;Modelo;Ano;Placa;Cor;Valor;Câmbio;Observações;DataVenda\n";

    estoque.forEach(v => {
        csv += `ESTOQUE;${v.marca};${v.modelo};${v.ano};${v.placa};${v.cor};${formatarValor(v.valor)};${v.cambio || ""};${v.obs || ""};\n`;
    });

    vendidos.forEach(v => {
        csv += `VENDIDO;${v.marca};${v.modelo};${v.ano};${v.placa};${v.cor};${formatarValor(v.valor)};${v.cambio || ""};${v.obs || ""};${v.data_venda ? new Date(v.data_venda).toLocaleDateString("pt-BR") : ""}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "Relatorio_Completo.csv";
    link.click();
});
