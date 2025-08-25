'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Status_parametros extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Status_parametros.init({
    index_darger_menor: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Status_parametros',
  });
  return Status_parametros;
};