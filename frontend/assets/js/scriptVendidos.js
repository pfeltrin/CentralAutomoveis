// --- BOTÃO VOLTAR ---
const btnVoltar = document.getElementById("btnVoltar");
if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
        window.location.href = "/";
    });
}

// ==============================
// CARREGAR VEÍCULOS VENDIDOS
// ==============================
async function carregarVendidos() {
    const container = document.getElementById("listaVendidos");
    if (!container) return;

    container.innerHTML = "<p>Carregando...</p>";

    try {
        const res = await fetch("/veiculosVendidos");
        const lista = await res.json();

        container.innerHTML = "";

        if (!Array.isArray(lista) || lista.length === 0) {
            container.innerHTML = "<p>Nenhum veículo vendido ainda.</p>";
            return;
        }

        lista.forEach(v => {
            const card = document.createElement("div");
            card.classList.add("card");

            const valorFormatado = Number(v.valor).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

            card.innerHTML = `
                <img src="${v.foto || '/assets/placeholder.png'}" class="fotoCarro">
                <h3>${v.marca || ''} ${v.modelo || ''}</h3>
                <p><strong>Ano:</strong> ${v.ano || ''}</p>
                <p><strong>Placa:</strong> ${v.placa || ''}</p>
                <p><strong>Cor:</strong> ${v.cor || ''}</p>
                <p><strong>Valor:</strong> ${valorFormatado}</p>
                <p><strong>Data da Venda:</strong> ${new Date(v.data_venda).toLocaleDateString("pt-BR")}</p>
                <button class="btnExcluir" data-veiculo-id="${v.veiculo_id}" data-venda-id="${v.venda_id}">Excluir</button>
            `;

            container.appendChild(card);
        });

        adicionarEventoExcluir();

    } catch (err) {
        console.error("Erro ao carregar veículos vendidos:", err);
        container.innerHTML = "<p>Erro ao carregar veículos vendidos.</p>";
    }
}

// ==============================
// EXCLUIR (MOVER PARA ESTOQUE)
// ==============================
function adicionarEventoExcluir() {
    document.querySelectorAll(".btnExcluir").forEach(btn => {
        btn.addEventListener("click", async function () {
            const vendaId = this.dataset.vendaId;
            const veiculoId = this.dataset.veiculoId;

            if (!confirm("Deseja excluir este veículo da lista de vendidos? (Ele será movido de volta ao estoque)"))
                return;

            try {
                // 1️⃣ Atualiza veículo (vendido = false)
                const resUpdate = await fetch(`/veiculos/${veiculoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vendido: false }) // os demais campos permanecem
            });


                if (!resUpdate.ok) throw new Error("Erro ao atualizar veículo.");

                // 2️⃣ Remove registro na tabela vendas
                const resDelete = await fetch(`/vendas/${vendaId}`, { method: "DELETE" });

                if (!resDelete.ok) throw new Error("Erro ao remover registro de venda.");

                alert("Veículo removido dos vendidos e movido ao estoque!");
                if (typeof carregarVeiculos === "function") carregarVeiculos();

            } catch (err) {
                console.error("Erro:", err);
                alert("Erro ao conectar com o servidor.");
            }
        });
    });
}

// ==============================
// INICIALIZAR
// ==============================
document.addEventListener("DOMContentLoaded", carregarVendidos);