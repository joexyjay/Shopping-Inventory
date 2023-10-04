import { config } from "dotenv";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid} from 'uuid'
import { Product } from "../model/product";

config()

const control = {
    create: async (req:Request, res: Response, next: NextFunction)=>{
        const {
            name,
            price,
            description,
            quantity,
            category,
        } = req.body

        //generate unique id
        const id = uuid()

        //create product with the data given
        try{
            const newProduct = await Product.create({
                id,
                name,
                price,
                description,
                quantity: Number(quantity),
                category
            })
            
            
            //respond on successful product creation
            res.status(201).render('admin_success',{
                message: 'new product added',
                data: `name: ${name}, price: ${price}, quantity: ${quantity}`
            })


        }
        catch(err){
            console.error(err)
            res.status(500).json({
                message: 'internal server error',
                error: err
            })
        }
    },
    getAll: async (req:Request, res: Response, next: NextFunction)=>{
        try{

            //find all products with summarized details(id,name,quantity,price)
            const allProd = await Product.findAll({
                attributes: ['id', 'name', 'quantity', 'price']

            })

            //respond with all products
            if(allProd.length){
                return res.render('admin_inventory',{
                    data: allProd
                })
            }

            //respond if no products are in the database
            res.render('admin_error',{
                message: 'No products available',
                data: ''
            })
        }
        catch(err){
            res.status(500).json({
                message: 'internal server error',
                error: err
            })
        }
    },
    getAllSalesman: async (req:Request, res: Response, next: NextFunction)=>{
        try{

            //find all products with summarized details(id,name,quantity,price)
            const allProd = await Product.findAll({
                attributes: ['id', 'name', 'quantity', 'price']

            })

            //respond with all products
            if(allProd.length){
                return res.render('sales_inv',{
                    data: allProd
                })
            }

            //respond if no products are in the database
            res.render('sale_error',{
                message: 'No products available',
                data: ''
            })
        }
        catch(err){
            res.status(500).json({
                message: 'internal server error',
                error: err
            })
        }
    },
    getOne: async (req:Request, res: Response, next: NextFunction)=>{
        const {name} = req.body
        try{
            //find product by name given
            const prod = await Product.findOne({
                where: {name},
                attributes: ['id', 'name', 'quantity', 'price', 'description']
            })

            //respond with product details if found
            if(prod){
                return res.json({
                    data: prod
                })
            }

            //respond with error if product not found
            res.json({
                message: 'No match found'
            })
        }
        catch(err){
            console.error(err)
            res.status(500).json({
                message: 'internal server error',
                error: err
            })
        }
    },
    restock: async (req:Request, res: Response, next: NextFunction)=>{
        const {
            name,
            quantity
        } = req.body
        console.log(req)
        console.log(name, quantity)

        try{

            //find product by name given
            const prod = await Product.findOne({
                where: {name},
                attributes: ['id', 'name', 'quantity', 'price']
            })

            //return error if product not found
            if(!prod){
                return res.render('admin_error', {
                    message: 'No matching product',
                    data: ''
                })
            }

            //update product stock
            const newStock = Number(prod.dataValues.quantity) + Number(quantity)
            await prod.update({quantity: newStock})

            //respond with new data
            res.render('admin_success',{
                message: 'new stock added',
                data: `name: ${name}, quantity: ${newStock}`
            })

        }
        catch(err){
            console.error(err)
            res.status(500).json({
                message: 'internal server error',
                error: err
            })
        }
    },
    makeSale: async (req:Request, res: Response, next: NextFunction)=>{
        const {
            name,
            quantity
        } = req.body

        try{

            //find product by name provided
            const prod = await Product.findOne({
                where: {name},
                attributes: ['id', 'name', 'quantity', 'price']
            })

            //return error if product is not found
            if(!prod){
                return res.render('sale_error',{
                    message: 'No matching product',
                    data: ''
                })
            }

            //return error if the sale quantity is more than stock
            if(Number(quantity) > Number(prod.dataValues.quantity)){
                return res.render('sale_error',{
                    message: 'Stock insufficient',
                    data: `only ${prod.dataValues.quantity} available`
                })
            }

            //reduce product quantity and update
            const newStock = Number(prod.dataValues.quantity) - Number(quantity)
            await prod.update({quantity: newStock})

            //create sale reciept
            const sale = {
                id: prod.dataValues.id,
                name: name,
                quantity: quantity,
                price: prod.dataValues.price,
                total: Number(quantity) * Number(prod.dataValues.price)
            }
            res.render('sale_success',{
                message: 'purchase successful',
                data: sale
            })

        }
        catch(err){
            console.error(err)
            res.status(500).json({
                message: 'internal server error',
                error: err
            })
        }
    },
    deleteProduct: async (req:Request, res: Response, next: NextFunction)=>{
        const {name} = req.body
        try{

            //find product by name
            const prod = await Product.findOne({
                where: {name}
            })

            //return error if no product is found
            if(!prod){
                return res.json({
                    message: 'Product not found'
                })
            }
            
            //delete product and respond appropriately
            await prod.destroy()
            res.json({
                message: `${name} removed`
            })
        }
        catch(err){
            console.error(err)
            res.status(500).json({
                message: 'internal server error',
                error: err
            })
        }
    },
    updatePrice: async (req:Request, res: Response, next: NextFunction)=>{
        const {name, price} = req.body
        try{
            //find product specified by name
            const prod = await Product.findOne({
                where: {name},
                attributes: ['id', 'name', 'price', 'quantity']
            })

            //return error message if no product is found
            if(!prod){
                return res.json({
                    message: 'No product match'
                })
            }

            //update price with new price specified
            await prod.update({price: price})
            res.json({
                message: 'Price updated',
                data: prod
            })

        }
        catch(err){
            console.error(err)
            res.status(500).json({
                message: 'internal server error',
                error: err
            })
        }
        
    },
    lowStock: async (req:Request, res: Response, next: NextFunction)=>{
        try{
            //find all products in light category
            const light = await Product.findAll({
                where: {category: 'light'},
                attributes: ['id', 'name', 'quantity']
            })

            //find any low stock: light
            const lowLight = light.filter(p => p.dataValues.quantity < 25)

            //find all products in mid category
            const mid = await Product.findAll({
                where: {category: 'mid'},
                attributes: ['id', 'name', 'quantity']
            })

            //find any low stock: mid
            const lowMid = mid.filter(p => p.dataValues.quantity < 10)

            //find all products in large category
            const large = await Product.findAll({
                where: {category: 'large'},
                attributes: ['id', 'name', 'quantity']
            })

            //find any low stock: large
            const lowLarge = large.filter(p => p.dataValues.quantity < 5)

            const lowProducts = [...lowLight,...lowMid,...lowLarge]

            if(lowProducts.length === 0){
                return res.json({
                    message: 'No stocks are low'
                })
            }
            res.json({
                message: 'low stock',
                data: lowProducts
            })
            
            
        }
        catch(err){
            console.error(err)
            res.status(500).json({
                message: 'internal server error',
                error: err
            })
        }
    }
}

export default control