const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Rank = sequelize.define("rank", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  question: {
    type: Sequelize.INTEGER,
  },
  right: {
    type: Sequelize.INTEGER,
  },
  rank: {
    type: Sequelize.INTEGER,
  },
});

module.exports = Rank;
