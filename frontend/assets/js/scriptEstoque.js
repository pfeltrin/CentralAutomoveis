// ==============================
//   BOTÃO VOLTAR
// ==============================
const btnVoltar = document.getElementById("btnVoltar");
if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
        window.location.href = "/";
    });
}

// ==============================
//   CONVERTER VALOR PT-BR → número
// ==============================
function parseValorBR(valor) {
    if (!valor || typeof valor === "number") return Number(valor) || 0;
    return Number(String(valor).replace(/\./g, "").replace(",", "."));
}

// ==============================
//   CARREGAR VEÍCULOS EM ESTOQUE
// ==============================
async function carregarVeiculos() {
    const container = document.getElementById("listaVeiculos");
    if (!container) return;

    container.innerHTML = "<p>Carregando...</p>";

    try {
        const res = await fetch("/veiculos?vendido=0");
        const lista = await res.json();

        container.innerHTML = "";

        if (!lista.length) {
            container.innerHTML = "<p>Nenhum veículo no estoque.</p>";
            return;
        }

        lista.forEach(v => criarCardVeiculo(v, container));

        adicionarEventosExcluir();
        adicionarEventosEditar();
        adicionarEventosVendido();
        estilizarBotoesExcluir();

    } catch (err) {
        console.error("Erro ao carregar veículos:", err);
        container.innerHTML = "<p>Erro ao carregar veículos.</p>";
    }
}

function criarCardVeiculo(v, container) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = v.id;

    card.innerHTML = `
        <img src="${v.foto || '/assets/placeholder.png'}" class="fotoCarro">
        <h3>${v.marca} ${v.modelo}</h3>
        <p><strong>Ano:</strong> ${v.ano}</p>
        <p><strong>Placa:</strong> ${v.placa}</p>
        <p><strong>Cor:</strong> ${v.cor}</p>
        <p><strong>Valor:</strong> ${Number(v.valor).toLocaleString("pt-BR", {
             style: "currency", 
             currency: "BRL" 
            })}</p>
        <button class="btnVendido" data-id="${v.id}">✔ Marcar como Vendido</button>
        <button class="btnEditar" data-id="${v.id}">Editar</button>
        <button class="btnExcluir" data-id="${v.id}">Excluir</button>
    `;

    container.appendChild(card);
}

// ==============================
//   CARREGAR VEÍCULOS VENDIDOS
// ==============================
async function carregarVendidos() {
    const container = document.getElementById("listaVendidos");
    if (!container) return;

    container.innerHTML = "<p>Carregando...</p>";

    try {
        const res = await fetch("/veiculos?vendido=1");
        const lista = await res.json();

        container.innerHTML = "";

        if (!lista.length) {
            container.innerHTML = "<p>Nenhum veículo vendido ainda.</p>";
            return;
        }

        lista.forEach(v => {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <img src="${v.foto || '/assets/placeholder.png'}" class="fotoCarro">
                <h3>${v.marca} ${v.modelo}</h3>
                <p><strong>Ano:</strong> ${v.ano}</p>
                <p><strong>Placa:</strong> ${v.placa}</p>
                <p><strong>Cor:</strong> ${v.cor}</p>
                <p><strong>Valor:</strong> ${Number(v.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Erro ao carregar vendidos:", err);
        container.innerHTML = "<p>Erro ao carregar veículos vendidos.</p>";
    }
}

// ==============================
//   EXCLUIR VEÍCULO
// ==============================
function adicionarEventosExcluir() {
    document.querySelectorAll(".btnExcluir").forEach(btn => {
        btn.addEventListener("click", async function () {
            const id = this.dataset.id;
            if (!confirm("Excluir este veículo?")) return;

            try {
                const res = await fetch(`/veiculos/${id}`, { method: "DELETE" });

                if (res.ok) {
                    carregarVeiculos();
                    carregarVendidos();
                } else {
                    alert("Erro ao excluir veículo.");
                }

            } catch (err) {
                alert("Erro ao conectar com o servidor.");
            }
        });
    });
}

// ==============================
//   EDITAR VEÍCULO
// ==============================
async function abrirEdicao(veiculo) {
    if (!veiculo || !veiculo.id) {
        alert("Erro ao carregar dados do veículo.");
        return;
    }

    const modal = document.createElement("div");
    modal.classList.add("modalEdicao");

    modal.innerHTML = `
        <div class="conteudoModal">
            <h2>Editar Veículo</h2>

            <label>Marca:</label><input id="editMarca" value="${veiculo.marca || ''}">
            <label>Modelo:</label><input id="editModelo" value="${veiculo.modelo || ''}">
            <label>Ano:</label><input type="number" id="editAno" value="${veiculo.ano || ''}">
            <label>Placa:</label><input id="editPlaca" value="${veiculo.placa || ''}">
            <label>Cor:</label><input id="editCor" value="${veiculo.cor || ''}">
            <label>Valor:</label>
            <input id="editValor" value="${Number(veiculo.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}">
            <button id="btnSalvarEdicao">Salvar</button>
            <button id="btnCancelarEdicao">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("btnCancelarEdicao").onclick = () => modal.remove();

    document.getElementById("btnSalvarEdicao").onclick = async () => {
        const dados = {
            marca: document.getElementById("editMarca").value,
            modelo: document.getElementById("editModelo").value,
            ano: document.getElementById("editAno").value,
            placa: document.getElementById("editPlaca").value,
            cor: document.getElementById("editCor").value,
            valor: parseValorBR(document.getElementById("editValor").value),
            vendido: veiculo.vendido || 0,
            foto: veiculo.foto
        };

        try {
            const res = await fetch(`/veiculos/${veiculo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            if (res.ok) {
                alert("Alterações salvas!");
                modal.remove();
                carregarVeiculos();
                carregarVendidos();
            } else {
                alert("Erro ao salvar edição.");
            }

        } catch (err) {
            alert("Erro ao conectar com o servidor.");
        }
    };
}

function adicionarEventosEditar() {
    document.querySelectorAll(".btnEditar").forEach(btn => {
        btn.addEventListener("click", async function () {
            try {
                const res = await fetch(`/veiculos/${this.dataset.id}`);
                const veiculo = await res.json();
                abrirEdicao(veiculo);

            } catch (err) {
                alert("Erro ao buscar dados do veículo.");
            }
        });
    });
}

// ==============================
//   MARCAR COMO VENDIDO
// ==============================
function adicionarEventosVendido() {
    document.querySelectorAll(".btnVendido").forEach(btn => {
        btn.addEventListener("click", async function () {
            const id = this.dataset.id;

            if (!confirm("Confirmar venda?")) return;

            try {
                const res = await fetch("/vendas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ veiculo_id: id })
                });

                if (res.ok) {
                    alert("Veículo vendido com sucesso!");
                    carregarVeiculos();
                    carregarVendidos();
                } else {
                    const erro = await res.json().catch(() => ({ error: res.statusText }));
                    alert("Erro ao vender veículo: " + erro.error);
                }

            } catch (err) {
                alert("Erro ao conectar com o servidor.");
            }
        });
    });
}

// ==============================
//   ESTILIZAR BOTÕES
// ==============================
function estilizarBotoesExcluir() {
    document.querySelectorAll(".btnExcluir, .btnEditar").forEach(botao => {
        botao.style.backgroundColor = "#b00000";
        botao.style.color = "#fff";
        botao.style.width = "49%";

        botao.onmouseenter = () => botao.style.backgroundColor = "#800000";
        botao.onmouseleave = () => botao.style.backgroundColor = "#b00000";
    });
}

// ==============================
//   INICIALIZAR
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    carregarVeiculos();
    carregarVendidos();
});
