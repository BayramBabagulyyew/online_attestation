const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Test = sequelize.define("test", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  question: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  answer: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  fake1: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  fake2: {
    type: Sequelize.STRING,
  },
  fake3: {
    type: Sequelize.STRING,
  },
});

module.exports = Test;
