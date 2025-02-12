const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Admin = sequelize.define("admin", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.INTEGER,
  },
});

module.exports = Admin;
