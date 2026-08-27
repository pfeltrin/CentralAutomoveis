const express = require("express");
const router = express.Router();
const { db } = require("../../../database/db");


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
        const veiculo = await db.getAsync(
            "SELECT * FROM veiculos WHERE id = ?",
            [veiculo_id]
        );

        if (!veiculo) {
            return res.status(404).json({ error: "Veículo não encontrado" });
        }

        if (veiculo.vendido === 1) {
            return res.status(400).json({ error: "Veículo já está vendido" });
        }

        // 2️⃣ Marca o veículo como vendido
        await db.runAsync(
            "UPDATE veiculos SET vendido = 1 WHERE id = ?",
            [veiculo_id]
        );

        // 3️⃣ Registra venda
        const dataVenda = new Date().toISOString();

        // CORREÇÃO AQUI: Adicionada a 3ª interrogação e o valor vindo de 'veiculo.valor'
        await db.runAsync(
            "INSERT INTO vendas (veiculo_id, valor, data) VALUES (?, ?, ?)",
            [veiculo_id, veiculo.valor, dataVenda]
        );

        res.json({ message: "Veículo vendido com sucesso!" });

    } catch (err) {
        console.error("Erro ao registrar venda:", err);
        res.status(500).json({ error: err.message });
    }
});

// =======================
// 📌 LISTAR VENDAS
// =======================
router.get("/", async (req, res) => {

    try {

        const vendas = await db.allAsync(`
            SELECT
                v.id AS venda_id,
                v.data AS data_venda,
                ve.id AS veiculo_id,
                ve.marca,
                ve.modelo,
                ve.placa,
                ve.cor,
                ve.valor,
                ve.foto
            FROM vendas v
            JOIN veiculos ve ON v.veiculo_id = ve.id
            ORDER BY v.data DESC
        `);

        res.json(vendas);

    } catch (err) {
        console.error("Erro ao listar vendas:", err);
        res.status(500).json({ error: err.message });
    }

});


// =======================
// 📌 DESFAZER VENDA
// =======================
router.delete("/:id", async (req, res) => {

    const { id } = req.params;

    try {

        // Busca venda
        const venda = await db.getAsync(
            "SELECT veiculo_id FROM vendas WHERE id = ?",
            [id]
        );

        if (!venda) {
            return res.status(404).json({ error: "Venda não encontrada." });
        }

        const veiculo_id = venda.veiculo_id;

        // Remove venda
        await db.runAsync(
            "DELETE FROM vendas WHERE id = ?",
            [id]
        );

        // Retorna veículo ao estoque
        await db.runAsync(
            "UPDATE veiculos SET vendido = 0 WHERE id = ?",
            [veiculo_id]
        );

        res.json({ message: "Venda removida e veículo retornado ao estoque." });

    } catch (err) {
        console.error("Erro ao remover venda:", err);
        res.status(500).json({ error: err.message });
    }

});

module.exports = router; 