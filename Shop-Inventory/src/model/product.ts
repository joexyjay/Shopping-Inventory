import sequelize from "../config/db.config";
import { DataTypes, Model } from "sequelize";

class Product extends Model{}

Product.init({
    id:{
        type: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },

    name:{
        type: DataTypes.STRING,
        allowNull: false,
        unique:true,
    },

    price:{
        type: DataTypes.NUMBER,
        allowNull: false,
    },

    description:{
        type:DataTypes.STRING,

    },

    quantity: {
        type: DataTypes.NUMBER,
        allowNull: false,
    },

    category: {
        type: DataTypes.ENUM("light", "mid", "large"),
        allowNull: false,
    }
}, {
    sequelize,
    modelName: "Product"
})

export {Product}