const express = require("express");
const router = express.Router();
const { db } = require("../../../database/db");

// =======================
// 📊 RELATÓRIO GERAL
// =======================
router.get("/", async (req, res) => {

    try {

        // Veículos em estoque
        const estoque = await db.allAsync(`
            SELECT *
            FROM veiculos
            WHERE vendido = 0
            ORDER BY id DESC
        `);

        // Veículos vendidos
        const vendidos = await db.allAsync(`
            SELECT
                vend.id AS venda_id,
                vend.data AS data_venda,
                v.id AS veiculo_id,
                v.marca,
                v.modelo,
                v.ano,
                v.placa,
                v.cor,
                v.cambio,
                v.valor,
                v.foto
            FROM vendas vend
            JOIN veiculos v
                ON v.id = vend.veiculo_id
            ORDER BY vend.id DESC
        `);

        res.json({
            estoque,
            vendidos
        });

    } catch (err) {

        console.error("Erro ao gerar relatório:", err);

        res.status(500).json({
            error: err.message
        });

    }

});

module.exports = router;