
const express = require('express');
const router = express.Router();
// Importa os modelos do seu diretório 'models'
const { Produto, Venda, sequelize } = require('../models'); 

// Rota 1: Valor Total do Estoque (Custo)
router.get('/total-estoque', async (req, res) => {
    try {
        // Usa uma consulta direta com o sequelize.literal para ser mais performante
        const totalEstoque = await Produto.sum(
            sequelize.literal('status * cost')
        );
        
        res.status(200).json({ totalEstoque: totalEstoque || 0 });
    } catch (error) {
        console.error('Erro ao calcular total do estoque:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao calcular estoque.' });
    }
});

// Rota 2: Total de Saídas (Receita)
router.get('/total-saidas', async (req, res) => {
    try {
        const totalSaidas = await Venda.sum('valorTotal');
        res.status(200).json({ totalSaidas: totalSaidas || 0 });
    } catch (error) {
        console.error('Erro ao calcular total de saídas:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao calcular saídas.' });
    }
});

// Rota 3: Lucro Mensal
router.get('/lucro-mensal', async (req, res) => {
    try {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Obter a receita do mês
        const receitaMensal = await Venda.sum('valorTotal', {
            where: {
                createdAt: {
                    [sequelize.Op.between]: [firstDayOfMonth, lastDayOfMonth]
                }
            }
        });

        // Obter os custos dos produtos vendidos no mês
        const custosMensais = await Venda.sum(
            sequelize.literal('Venda.quantidade * produto.cost'),
            {
                where: {
                    createdAt: {
                        [sequelize.Op.between]: [firstDayOfMonth, lastDayOfMonth]
                    }
                },
                include: [{
                    model: Produto,
                    as: 'produto'
                }]
            }
        );
        
        const lucroTotal = (receitaMensal || 0) - (custosMensais || 0);
        
        res.status(200).json({ lucroTotal: lucroTotal });
    } catch (error) {
        console.error('Erro ao calcular lucro mensal:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao calcular lucro.' });
    }
});

module.exports = router;