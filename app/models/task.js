"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Task extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Task.init(
        {
            id: {
                type: DataTypes.INTEGER,
                field: "id",
                primaryKey: true,
                autoIncrement: true,
            },
            path: DataTypes.STRING,
            status: DataTypes.STRING,
            processed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: "Task",
        }
    );
    return Task;
};
