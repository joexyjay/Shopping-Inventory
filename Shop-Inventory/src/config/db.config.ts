import { config } from "dotenv";
import { Sequelize } from "sequelize";


config()

const username = process.env.USER_NAME || ""
const password = process.env.PASSKEY || ""
const sequelize = new Sequelize(
    "database",
    username,
    password,
    {
        dialect: "sqlite",
        storage: "./database.sqlite",
        logging: false
    }
)

export default sequelize;