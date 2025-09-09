// server/routes/boletos.js
const express = require('express');
const router = express.Router();
const { Boleto, sequelize } = require('../models');

// Rota para listar todos os boletos
router.get('/', async (req, res) => {
    try {
        const boletos = await Boleto.findAll();
        res.json(boletos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar boletos.' });
    }
});

// Rota para criar um novo boleto
router.post('/', async (req, res) => {
    try {
        const { valor, dataVencimento, descricao } = req.body;
        const novoBoleto = await Boleto.create({
            valor,
            dataVencimento,
            descricao,
            status: 'A Pagar'
        });
        res.status(201).json(novoBoleto);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar boleto.' });
    }
});

// Rota para atualizar o status de um boleto (marcar como pago)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { dataPagamento } = req.body;
        const [updated] = await Boleto.update({
            status: 'Pago',
            dataPagamento: dataPagamento || new Date()
        }, {
            where: { id: id }
        });

        if (updated) {
            const boletoAtualizado = await Boleto.findByPk(id);
            res.json(boletoAtualizado);
        } else {
            res.status(404).json({ error: 'Boleto não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar boleto.' });
    }
});

// Rota para excluir um boleto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Boleto.destroy({
            where: { id: id }
        });

        if (deleted) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: 'Boleto não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir boleto.' });
    }
});

// Nova Rota: Resumo de Boletos (A Vencer e Vencidos)
router.get('/resumo', async (req, res) => {
    try {
        const today = new Date();

        const aVencer = await Boleto.count({
            where: {
                status: 'A Pagar',
                dataVencimento: {
                    [sequelize.Op.gt]: today
                }
            }
        });

        const vencidos = await Boleto.count({
            where: {
                status: 'A Pagar',
                dataVencimento: {
                    [sequelize.Op.lte]: today
                }
            }
        });
        
        res.status(200).json({ aVencer, vencidos });

    } catch (error) {
        console.error('Erro ao buscar resumo de boletos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

module.exports = router;