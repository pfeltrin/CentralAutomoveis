const express = require("express");
const router = express.Router();
const { db } = require("../../../database/db");

// ================================
//  LISTAR VEÍCULOS VENDIDOS
// ================================
router.get("/", async (req, res) => {
    try {

        const sql = `
            SELECT
                vend.id AS venda_id,
                vend.data AS data_venda,
                v.id AS veiculo_id,
                v.marca,
                v.modelo,
                v.ano,
                v.placa,
                v.cor,
                v.valor,
                v.foto
            FROM vendas vend
            INNER JOIN veiculos v
                ON v.id = vend.veiculo_id
            ORDER BY vend.id DESC
        `;

        const vendidos = await db.allAsync(sql);

        res.json(vendidos);

    } catch (err) {
        console.error("Erro ao buscar veículos vendidos:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 
