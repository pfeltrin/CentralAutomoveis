const express = require("express");
const router = express.Router();
const db = require("../database/connection");

// ================================
//  LISTAR VEÍCULOS (com filtro)
// ================================
router.get("/", async (req, res) => {
    try {
        const { vendido } = req.query;

        let query = "SELECT * FROM veiculos";
        let params = [];

        if (vendido !== undefined) {
            query += " WHERE vendido = $1";
            params.push(vendido);
        }

        const result = await db.query(query, params);
        res.json(result.rows);

    } catch (err) {
        console.error("Erro ao listar veículos:", err);
        res.status(500).json({ error: "Erro ao listar veículos" });
    }
});

// ================================
//  BUSCAR VEÍCULO POR ID
// ================================
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query("SELECT * FROM veiculos WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Veículo não encontrado" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("Erro ao buscar veículo:", err);
        res.status(500).json({ error: "Erro ao buscar veículo" });
    }
});

// ================================
//  CADASTRAR VEÍCULO
// ================================
router.post("/", async (req, res) => {
    try {
        const { marca, modelo, ano, placa, cor, valor, foto } = req.body;

        const query = `
            INSERT INTO veiculos (marca, modelo, ano, placa, cor, valor, foto, vendido)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *;
        `;

        // vendido sempre começa como FALSE no cadastro
        const values = [marca, modelo, ano, placa, cor, valor, foto, false];

        const result = await db.query(query, values);

        res.json(result.rows[0]);

    } catch (err) {
        console.error("Erro ao cadastrar veículo:", err);
        res.status(500).json({ error: "Erro ao cadastrar veículo" });
    }
});

// ================================
//  EDITAR VEÍCULO
// ================================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { marca, modelo, ano, placa, cor, valor, vendido, foto } = req.body;

        // Pega o veículo atual
        const veiculoAtual = await db.query("SELECT * FROM veiculos WHERE id = $1", [id]);
        if (veiculoAtual.rows.length === 0)
            return res.status(404).json({ error: "Veículo não encontrado" });

        const v = veiculoAtual.rows[0];

        // Atualiza apenas os campos enviados, mantendo os demais
        const query = `
            UPDATE veiculos 
            SET 
                marca = COALESCE($1, marca),
                modelo = COALESCE($2, modelo),
                ano = COALESCE($3, ano),
                placa = COALESCE($4, placa),
                cor = COALESCE($5, cor),
                valor = COALESCE($6, valor),
                vendido = COALESCE($7, vendido),
                foto = COALESCE($8, foto)
            WHERE id = $9
            RETURNING *;
        `;
        const values = [
            marca, modelo, ano, placa, cor, valor, vendido, foto, id
        ];

        const result = await db.query(query, values);
        res.json(result.rows[0]);

    } catch (err) {
        console.error("Erro ao editar veículo:", err);
        res.status(500).json({ error: "Erro ao editar veículo" });
    }
});


// ================================
//  EXCLUIR VEÍCULO
// ================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM veiculos WHERE id = $1", [id]);

        res.json({ message: "Veículo excluído!" });

    } catch (err) {
        console.error("Erro ao excluir veículo:", err);
        res.status(500).json({ error: "Erro ao excluir veículo" });
    }
});

module.exports = router;
