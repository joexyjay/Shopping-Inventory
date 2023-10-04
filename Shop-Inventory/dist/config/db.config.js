"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const sequelize_1 = require("sequelize");
(0, dotenv_1.config)();
const username = process.env.USER_NAME || "";
const password = process.env.PASSKEY || "";
const sequelize = new sequelize_1.Sequelize("database", username, password, {
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false
});
exports.default = sequelize;
