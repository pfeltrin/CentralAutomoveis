const express = require("express");
const router = express.Router();
const { db } = require("../../../database/db");

// ================================
// 📌 LISTAR VEÍCULOS
// ================================
router.get("/", async (req, res) => {
    try {
        const { vendido } = req.query;
        let query = "SELECT * FROM veiculos";
        let params = [];

        if (vendido !== undefined) {
            const vendidoInt = vendido === "true" || vendido === "1" ? 1 : 0;
            query += " WHERE vendido = ?";
            params.push(vendidoInt);
        }

        const veiculos = await db.allAsync(query, params);
        res.json(veiculos);
    } catch (err) {
        console.error("Erro ao listar veículos:", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// 📌 BUSCAR VEÍCULO POR ID
// ================================
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const veiculo = await db.getAsync("SELECT * FROM veiculos WHERE id = ?", [id]);

        if (!veiculo) {
            return res.status(404).json({ error: "Veículo não encontrado" });
        }
        res.json(veiculo);
    } catch (err) {
        console.error("Erro ao buscar veículo:", err);
        res.status(500).json({ error: err.message });
    }
});

// ================================
// 📌 CADASTRAR VEÍCULO
// ================================
router.post("/", async (req, res) => {
    try {
        const { marca, modelo, ano, placa, cor, cambio, valor, foto } = req.body;

        const query = `
            INSERT INTO veiculos (marca, modelo, ano, placa, cor, cambio, valor, foto, vendido)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.runAsync(query, [
            marca, modelo, ano, placa, cor, cambio, valor, foto, 0
        ]);

        const novoVeiculo = await db.getAsync("SELECT * FROM veiculos WHERE id = ?", [result.lastID]);
        res.json(novoVeiculo);
    } catch (err) {
        console.error("Erro ao cadastrar veículo:", err);
        res.status(500).json({ error: err.message });
    }
});

// ===========================================
// 📌 EDITAR VEÍCULO (VERSÃO FINAL CORRIGIDA)
// ===========================================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { marca, modelo, ano, placa, cor, cambio, valor, foto } = req.body;

        // 1. Verifica se o veículo existe e pega os dados atuais
        const veiculo = await db.getAsync("SELECT * FROM veiculos WHERE id = ?", [id]);

        if (!veiculo) {
            return res.status(404).json({ error: "Veículo não encontrado" });
        }

        // 2. Executa a atualização com lógica de fallback (mantém o valor antigo se o novo for vazio)
        await db.runAsync(
            `UPDATE veiculos SET 
                marca = ?, 
                modelo = ?, 
                ano = ?, 
                placa = ?, 
                cor = ?, 
                cambio = ?, 
                valor = ?, 
                foto = ? 
            WHERE id = ?`,
            [
                marca || veiculo.marca,
                modelo || veiculo.modelo,
                ano || veiculo.ano,
                placa || veiculo.placa,
                cor || veiculo.cor,
                cambio || veiculo.cambio,
                valor || veiculo.valor,
                foto || veiculo.foto,
                id
            ]
        );

        // 3. Delay estratégico de 50ms para garantir que o SQLite liberou o arquivo no Windows/Electron
        await new Promise(resolve => setTimeout(resolve, 50));

        // 4. Busca o dado atualizado diretamente do banco para confirmar a persistência
        const atualizado = await db.getAsync("SELECT * FROM veiculos WHERE id = ?", [id]);

        res.json(atualizado);
    } catch (err) {
        console.error("❌ Erro ao editar veículo:", err);
        res.status(500).json({ error: "Erro interno ao atualizar veículo" });
    }
});

// ================================
// 📌 EXCLUIR VEÍCULO
// ================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.runAsync("DELETE FROM veiculos WHERE id = ?", [id]);
        res.json({ message: "Veículo excluído com sucesso" });
    } catch (err) {
        console.error("Erro ao excluir veículo:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;