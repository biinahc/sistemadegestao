const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const UserModel = require('./models/users');
const ProduModel = require('./models/productos');
const CategoriaModel = require('./models/categorias');
const ParametrosModel = require('./models/status_parametros');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcrypt');


app.use(cors())
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
const users = UserModel(sequelize, DataTypes)
const produtos = ProduModel(sequelize, DataTypes)
const categorias = CategoriaModel(sequelize, DataTypes)
const parametros = ParametrosModel(sequelize, DataTypes)


// Ruta para login


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

  }else if(match && user.status === 'Activo' && user.perfil === 'Admin'){
    res.status(200).json({ success: true, message: 'Login com sucesso e Admin' });

  }else if(match && user.status === 'Activo' && user.perfil === 'Usuario'){
    res.status(202).json({ error: true, message: 'Login feito com sucesso e Usuário' });

    }else if(match && user.status === 'Inativo'){
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
  const {name, senha, status, perfil} = req.body;
  const saltRounds = 1; // Puedes ajustar el número de rondas de sal
  const hashedPassword = await bcrypt.hash(senha, saltRounds);

  await users.create({ name, senha:hashedPassword, status, perfil });
  //const User = await users.create({ nome, senha:hashedPassword, status, perfil });
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
  
  const {senha} = req.body;
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
  const ids = req.body.ids; // Se espera un array de IDs a eliminar

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
  const {lt_kl_unid, marca, nome, quantidade, quantidade_minima,tipo_producto} = req.body;

    // Capitalizar solo la primera letra 
    const capitalizeFirstLetter = (string) => {
      if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    // Función para eliminar acentos
    const removeAccents = (string) => {
      return string
          .normalize('NFD') // Normaliza el string
          .replace(/[\u0300-\u036f]/g, ''); // Elimina los caracteres de acento
    };
  const marcaSemacentos = removeAccents(marca);
  const upperMarca = capitalizeFirstLetter(marcaSemacentos);
  const nomeSemacentos = removeAccents(nome);
  const upperNome = capitalizeFirstLetter(nomeSemacentos);

  const product = await produtos.findOne({ where: { marca: upperMarca } });
  if(!product) {
    await produtos.create({ lt_kl_unid, marca:upperMarca, nome:upperNome, quantidade, quantidade_minima,tipo_producto});
   /* const product = await produtos.create(req.body);*/
    res.json(marca);
  } else {
    return res.status(404).json({ message: 'Produto já cadastrado' });
  }
});


app.put('/produtos/update/:id', async (req, res) => {
  const {
    lt_kl_unid,
    marca,
    nome,
    quantidade,
    quantidade_minima,
    tipo_producto
  } = req.body;

  try {
    const product = await produtos.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    if (quantidade_minima < 0 || quantidade < 0) {
      return res.status(400).json({ message: 'Não use quantidades negativas' });
    }

    await product.update({
      lt_kl_unid,
      marca,
      nome,
      quantidade,
      quantidade_minima,
      tipo_producto
    });

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

// Multi delete 
app.delete('/items/produtos', async (req, res) => {
  const ids = req.body.ids; // Se espera un array de IDs a eliminar

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
  const {tipo_producto} = req.body;
  try {
    const categori = await produtos.findOne({ where: {tipo_producto} });

    if (categori) {
      res.status(200).json({ success: true, message: 'Categoria encontrada' });
    } else {
      res.status(401).json({ success: false, message: 'Não existe' });
    }

  } catch (error) {
    res.status(500).send('Error during login');
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
