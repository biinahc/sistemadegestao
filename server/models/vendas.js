'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venda extends Model {
    static associate(models) {
      Venda.belongsTo(models.Producto, {
        foreignKey: 'produtoId',
        as: 'produto'
      });
    }
  }
  Venda.init({
    produtoId: DataTypes.INTEGER,
    quantidade: DataTypes.DECIMAL,
    valorTotal: DataTypes.DECIMAL,
    formaPagamento: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Venda',
  });
  return Venda;
};