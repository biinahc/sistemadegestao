const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const UserModel = require('./models/users');
const ProduModel = require('./models/productos');
const CategoriaModel = require('./models/categorias');
const ParametrosModel = require('./models/status_parametros');
const { Sequelize, DataTypes, Op } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcrypt');
const BoletoModel = require('./models/boleto');

app.use(cors());
app.get('/', (req, res) => {
    res.send('<h2>Servidor Iniciado!</h2>');
});

// Create Sequelize instance
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './projecto.db'
});

// Middleware para parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Instanciando os Modelos
const users = UserModel(sequelize, DataTypes);
const produtos = ProduModel(sequelize, DataTypes);
const categorias = CategoriaModel(sequelize, DataTypes);
const parametros = ParametrosModel(sequelize, DataTypes);
const boletos = BoletoModel(sequelize, DataTypes);

// Rota para login
app.post('/login', async (req, res) => {
    const { name, senha } = req.body;
    const user = await users.findOne({ where: { name } });
    if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    try {
        const match = await bcrypt.compare(senha, user.senha);
        if (!match) {
            res.status(403).json({ success: true, message: 'Senha incorreta' });
        } else if (match && user.status === 'Activo' && user.perfil === 'Admin') {
            res.status(200).json({ success: true, message: 'Login com sucesso e Admin' });
        } else if (match && user.status === 'Activo' && user.perfil === 'Usuario') {
            res.status(202).json({ error: true, message: 'Login feito com sucesso e Usuário' });
        } else if (match && user.status === 'Inativo') {
            res.status(401).json({ error: true, message: 'Usuário Inativo' });
        }
    } catch (error) {
        res.status(500).send('Error during login');
    }
});

// CRUD routes para modelo Users *********************//
app.get('/users', async (req, res) => {
    const user = await users.findAll();
    res.json(user);
});

app.get('/users/:id', async (req, res) => {
    const user = await users.findByPk(req.params.id);
    res.json(user);
});

app.post('/users/create', async (req, res) => {
    const { name, senha, status, perfil } = req.body;
    const saltRounds = 1;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);
    await users.create({ name, senha: hashedPassword, status, perfil });
    res.json(name);
});

app.put('/users/update/:id', async (req, res) => {
    const user = await users.findByPk(req.params.id);
    if (user) {
        await user.update(req.body);
        res.json(user);
    } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
    }
});

app.put('/senha/update/:id', async (req, res) => {
    const { senha } = req.body;
    const saltRounds = 1;
    const novoPassword = await bcrypt.hash(senha, saltRounds);
    const user = await users.findByPk(req.params.id);
    if (user) {
        user.senha = novoPassword;
        await user.save();
        res.json(novoPassword);
    } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
    }
});

app.delete('/users/:id', async (req, res) => {
    const user = await users.findByPk(req.params.id);
    if (user) {
        await user.destroy();
        res.json({ message: 'Usuário excluído' });
    } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
    }
});

// Multi delete
app.delete('/items/users', async (req, res) => {
    const ids = req.body.ids;
    try {
        await users.destroy({
            where: {
                id: ids,
            },
        });
        res.status(200).json({ message: 'Usuários excluídos com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// *******************CRUD routes para modelo produtos *********************//
app.get('/produtos', async (req, res) => {
    const product = await produtos.findAll();
    res.json(product);
});

app.get('/produtos/:id', async (req, res) => {
    const product = await produtos.findByPk(req.params.id);
    res.json(product);
});

app.post('/produtos/create', async (req, res) => {
    const { lt_kl_unid, marca, nome, quantidade, quantidade_minima, tipo_producto } = req.body;
    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };
    const removeAccents = (string) => {
        return string
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };
    const marcaSemacentos = removeAccents(marca);
    const upperMarca = capitalizeFirstLetter(marcaSemacentos);
    const nomeSemacentos = removeAccents(nome);
    const upperNome = capitalizeFirstLetter(nomeSemacentos);
    const product = await produtos.findOne({ where: { marca: upperMarca } });
    if (!product) {
        await produtos.create({ lt_kl_unid, marca: upperMarca, nome: upperNome, quantidade, quantidade_minima, tipo_producto });
        res.json(marca);
    } else {
        return res.status(404).json({ message: 'Produto já cadastrado' });
    }
});

app.put('/produtos/update/:id', async (req, res) => {
    const { lt_kl_unid, marca, nome, quantidade, quantidade_minima, tipo_producto } = req.body;
    try {
        const product = await produtos.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        if (quantidade_minima < 0 || quantidade < 0) {
            return res.status(400).json({ message: 'Não use quantidades negativas' });
        }
        await product.update({ lt_kl_unid, marca, nome, quantidade, quantidade_minima, tipo_producto });
        res.json({ message: 'Produto atualizado!' });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

app.delete('/produtos/:id', async (req, res) => {
    const product = await produtos.findByPk(req.params.id);
    if (product) {
        await product.destroy();
        res.json({ message: 'Item excluído !' });
    } else {
        res.status(404).json({ message: 'Item não encontrado' });
    }
});

app.delete('/items/produtos', async (req, res) => {
    const ids = req.body.ids;
    try {
        await produtos.destroy({
            where: {
                id: ids,
            },
        });
        res.status(200).json({ message: 'Itens excluídos com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/produtos/update-preco/:id', async (req, res) => {
    const { id } = req.params;
    const { cost, price_cash, price_card } = req.body;
    try {
        const product = await produtos.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }
        await product.update({ cost, price_cash, price_card });
        res.status(200).json({ message: 'Preços atualizados com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar preços:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.put('/produtos/venda/:id', async (req, res) => {
    const { id } = req.params;
    const { quantidade_vendida, forma_pagamento } = req.body;
    try {
        const product = await produtos.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }
        const newStatus = parseFloat(product.status) - parseFloat(quantidade_vendida);
        if (newStatus < 0) {
            return res.status(400).json({ message: 'Quantidade vendida excede o estoque.' });
        }
        const VendaModel = require('./models/vendas');
        const vendas = VendaModel(sequelize, DataTypes);
        let valorTotal = 0;
        if (forma_pagamento === 'Dinheiro') {
            valorTotal = parseFloat(quantidade_vendida) * parseFloat(product.price_cash);
        } else if (forma_pagamento === 'Cartão') {
            valorTotal = parseFloat(quantidade_vendida) * parseFloat(product.price_card);
        }
        await vendas.create({
            produtoId: id,
            quantidade: quantidade_vendida,
            valorTotal: valorTotal,
            formaPagamento: forma_pagamento,
        });
        await product.update({ status: newStatus });
        res.status(200).json({ message: 'Venda registrada e estoque atualizado.' });
    } catch (error) {
        console.error('Erro ao registrar venda:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// *************** CATEGORIAS*********************************
app.post('/categorias/create', async (req, res) => {
    const categori = await categorias.create(req.body);
    res.json(categori);
});

app.get('/categorias', async (req, res) => {
    const categori = await categorias.findAll();
    res.json(categori);
});

app.delete('/categorias/:id', async (req, res) => {
    const categori = await categorias.findByPk(req.params.id);
    if (categori) {
        await categori.destroy();
        res.json({ message: 'Item excluído !' });
    } else {
        res.status(404).json({ message: 'Item não encontrado' });
    }
});

// *************** PARAMETROS *********************************
app.post('/parametro/create', async (req, res) => {
    const parametro = await parametros.create(req.body);
    res.json(parametro);
});

app.get('/parametros', async (req, res) => {
    const parame = await parametros.findAll();
    res.json(parame);
});

app.post('/categorias/buscar', async (req, res) => {
    const { tipo_producto } = req.body;
    try {
        const categori = await produtos.findOne({ where: { tipo_producto } });
        if (categori) {
            res.status(200).json({ success: true, message: 'Categoria encontrada' });
        } else {
            res.status(401).json({ success: false, message: 'Não existe' });
        }
    } catch (error) {
        res.status(500).send('Error during login');
    }
});

// *************** BOLETOS *********************************
app.get('/boletos', async (req, res) => {
    try {
        const boleto = await boletos.findAll();
        res.json(boleto);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar boletos.' });
    }
});

app.post('/boletos', async (req, res) => {
    try {
        const { valor, dataVencimento, descricao } = req.body;
        const novoBoleto = await boletos.create({ valor, dataVencimento, descricao, status: 'A Pagar' });
        res.status(201).json(novoBoleto);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar boleto.' });
    }
});

app.put('/boletos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { dataPagamento } = req.body;
        const [updated] = await boletos.update({ status: 'Pago', dataPagamento: dataPagamento || new Date() }, { where: { id: id } });
        if (updated) {
            const boletoAtualizado = await boletos.findByPk(id);
            res.json(boletoAtualizado);
        } else {
            res.status(404).json({ error: 'Boleto não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar boleto.' });
    }
});

app.delete('/boletos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await boletos.destroy({ where: { id: id } });
        if (deleted) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: 'Boleto não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir boleto.' });
    }
});

app.get('/boletos/resumo', async (req, res) => {
    try {
        const today = new Date();
        const aVencer = await boletos.count({
            where: {
                status: 'A Pagar',
                dataVencimento: {
                    [Op.gt]: today
                }
            }
        });
        const vencidos = await boletos.count({
            where: {
                status: 'A Pagar',
                dataVencimento: {
                    [Op.lte]: today
                }
            }
        });
        res.status(200).json({ aVencer, vencidos });
    } catch (error) {
        console.error('Erro ao buscar resumo de boletos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});