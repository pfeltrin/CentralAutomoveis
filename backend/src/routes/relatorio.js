const express = require("express");
const router = express.Router();
const db = require("../database/connection");

router.get("/", async (req, res) => {
    try {
        const estoqueResult = await db.query("SELECT * FROM veiculos WHERE vendido = FALSE ORDER BY id DESC");
        const vendidosResult = await db.query(`
            SELECT vend.id AS venda_id, vend.data_venda,
                   v.id AS veiculo_id, v.marca, v.modelo, v.ano, v.placa,
                   v.cor, v.valor, v.cambio, v.obs, v.foto
            FROM vendas vend
            JOIN veiculos v ON v.id = vend.veiculo_id
            ORDER BY vend.id DESC
        `);

        res.json({ estoque: estoqueResult.rows, vendidos: vendidosResult.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao gerar relatório" });
    }
});

module.exports = router;