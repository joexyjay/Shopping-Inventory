import sequelize from "../config/db.config";
import { DataTypes, Model } from "sequelize";

class Personnel extends Model{}

Personnel.init({
    id:{
        type: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },

    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    name: {
        type: DataTypes.STRING,

    },

    admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },

    endorsed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    }

},{
    sequelize,
    modelName: 'Personnel'
})

export {Personnel}