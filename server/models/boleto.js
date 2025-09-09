// server/models/boleto.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Boleto extends Model {
    static associate(models) {
      // Nenhum relacionamento neste momento
    }
  }
  Boleto.init({
    valor: DataTypes.DECIMAL,
    dataVencimento: DataTypes.DATEONLY,
    dataPagamento: DataTypes.DATEONLY,
    status: DataTypes.STRING,
    descricao: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Boleto',
  });
  return Boleto;
};