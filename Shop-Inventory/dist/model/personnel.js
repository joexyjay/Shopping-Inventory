"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Personnel = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const sequelize_1 = require("sequelize");
class Personnel extends sequelize_1.Model {
}
exports.Personnel = Personnel;
Personnel.init({
    id: {
        type: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
    },
    admin: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    endorsed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    }
}, {
    sequelize: db_config_1.default,
    modelName: 'Personnel'
});
