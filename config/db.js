const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || "cloud";
const config = require("./config.json")[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    dialectOptions: {
        // Your mariadb options here
        // connectTimeout: 1000
    },
});

module.exports = sequelize;