const express = require("express");
const router = express.Router();
const db = require("../database/connection");

// =======================
// 📌 REGISTRAR VENDA
// =======================
router.post("/", async (req, res) => {
const { veiculo_id } = req.body;

if (!veiculo_id) {
    return res.status(400).json({ error: "Veículo inválido" });
}

try {
    // 1️⃣ Verifica se o veículo existe
    const veiculoResult = await db.query(
        "SELECT * FROM veiculos WHERE id = $1",
        [veiculo_id]
    );

    if (veiculoResult.rows.length === 0) {
        return res.status(404).json({ error: "Veículo não encontrado" });
    }

    const veiculo = veiculoResult.rows[0];

    if (veiculo.vendido === 1) {
        return res.status(400).json({ error: "Veículo já está vendido" });
    }

    // 2️⃣ Marca o veículo como vendido
    await db.query(
        "UPDATE veiculos SET vendido = true WHERE id = $1", 
        [veiculo_id]
    );

    // 3️⃣ Registra venda com data local
    const dataVenda = new Date();
    await db.query(
        "INSERT INTO vendas (veiculo_id, data_venda) VALUES ($1, $2)",
        [veiculo_id, dataVenda]
    );

    res.json({ message: "Veículo vendido com sucesso!" });

} catch (err) {
    console.error("Erro ao registrar venda:", err);
    res.status(500).json({ error: "Erro ao registrar venda" });
}

});

// =======================
// 📌 LISTAR VENDAS
// =======================
router.get("/", async (req, res) => {
try {
const vendasResult = await db.query(`
    SELECT 
        v.id AS venda_id, 
        v.data_venda, 
        ve.id AS veiculo_id, 
        ve.marca, 
        ve.modelo, 
        ve.placa, 
        ve.cor, 
        ve.valor, 
        ve.foto
    FROM vendas v
    JOIN veiculos ve ON v.veiculo_id = ve.id
    ORDER BY v.data_venda DESC
`);

    res.json(vendasResult.rows);

} catch (err) {
    console.error("Erro ao listar vendas:", err);
    res.status(500).json({ error: "Erro ao listar vendas" });
}

});

// Remover venda (desfazer venda)
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Busca a venda pelo ID
        const venda = await db.query(
            "SELECT veiculo_id FROM vendas WHERE id = $1",
            [id]
        );

        if (venda.rows.length === 0) {
            return res.status(404).json({ error: "Venda não encontrada." });
        }

        const veiculo_id = venda.rows[0].veiculo_id;

        // 1) Apaga o registro da venda
        await db.query("DELETE FROM vendas WHERE id = $1", [id]);

        // 2) Atualiza o veículo para voltar ao estoque
        await db.query("UPDATE veiculos SET vendido = FALSE WHERE id = $1", [veiculo_id]);

        return res.json({ message: "Venda removida e veículo retornado ao estoque." });

    } catch (err) {
        console.error("Erro ao remover venda:", err);
        return res.status(500).json({ error: "Erro ao remover registro de venda." });
    }
});


module.exports = router;