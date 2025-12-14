const express = require("express");
const router = express.Router();
const db = require("../database/connection");

// === LISTAR VEÍCULOS VENDIDOS ===
router.get("/", async (req, res) => {
    const sql = `
        SELECT
            vend.id AS venda_id,
            vend.data_venda,
            v.id AS veiculo_id,
            v.marca,
            v.modelo,
            v.ano,
            v.placa,
            v.cor,
            v.valor,
            v.cambio,
            v.obs,
            v.foto
        FROM vendas vend
        INNER JOIN veiculos v ON v.id = vend.veiculo_id
        ORDER BY vend.id DESC
    `;

    try {
        const result = await db.query(sql);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao buscar veículos vendidos:", err);
        res.status(500).json({ error: "Erro ao buscar veículos vendidos" });
    }
});

module.exports = router;
