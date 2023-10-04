import { config } from "dotenv";
import { Request, Response, NextFunction } from "express";
import inputValidator from '../auth/valid'
import sequelize from "../config/db.config";
import { v4 as uuid} from 'uuid'
import { Personnel } from "../model/personnel";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";

config()

const control = {
    createAdmin: async (req: Request, res: Response, next : NextFunction)=>{
        const userInput = req.body
        const {error, value} = inputValidator.validate(userInput)
        if(error){
            next()
            return
        }
        const {
            email,
            password,
            name,
            adminkey
        }= value
        const id = uuid()
        const salt = 10
        try{
            const hash = bcrypt.hashSync(password, salt)
            if(adminkey === process.env.ADMINKEY){
                const personnel = await Personnel.create({
                    id,
                    name,
                    email,
                    password: hash,
                    admin: true,
                    endorsed: true,
                })

                 //generate a token on successful credentials
            const token = jwt.sign(
                {
                    userid: personnel.dataValues.id,
                    endorsed: personnel.dataValues.endorsed,
                    admin: personnel.dataValues.admin
                },
                process.env.JWT_SECRET!,
                {expiresIn: "1h"}
            )

            //to be removed, token is sensitive info
            console.log(token)

            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 })

            //attach token to req headers and pass to next
            req.headers = {...req.headers, authorization:`Bearer ${token}`}
                next()
                return
            }
            res.status(400).render('bad_login', {
                message: 'Invalid credentials',
                data: ''
            })
        }
        catch(err){
            console.error(err)
            res.status(500).json({
                message: 'Internal server error',
                error: err
            })
        }
        
    },
    create: async (req: Request, res: Response, next : NextFunction)=>{
        const userInput = {...req.body, adminkey: null}

        const {error, value} = inputValidator.validate(userInput)
        if(error){
            res.status(400).json({
                message: 'Internal server error',
                error: error
            })
            return
        }
        const {
            email,
            password,
            name
        }= value
        const id = uuid()
        const salt = 10
        
        try{
            const hash = bcrypt.hashSync(password, salt)
            const personnel = await Personnel.create({
                id,
                name,
                email,
                password: hash,
                admin: false,
                endorsed: false,
            })

                 //generate a token on successful credentials
                 const token = jwt.sign(
                    {
                        userid: personnel.dataValues.id,
                        endorsed: personnel.dataValues.endorsed,
                        admin: personnel.dataValues.admin
                    },
                    process.env.JWT_SECRET!,
                    {expiresIn: "1h"}
                )
    
                //to be removed, token is sensitive info
                console.log(token)
    
                res.cookie('token', token, { httpOnly: true, maxAge: 3600000 })
    
                //attach token to req headers and pass to next
                req.headers = {...req.headers, authorization:`Bearer ${token}`}


            next()
            return
        }
        catch(err){
            console.error(err)
            res.status(500).json({
                message: 'Internal server error',
                error: err
            })
        }
        
    },
    newUser: async (req: Request, res: Response, next : NextFunction)=>{
        res.redirect('/users/dashboard')
    },
    goToAdmin: async (req: Request, res: Response, next : NextFunction)=>{
        res.redirect('/admin/dashboard')
    },
    get: async (req: Request, res: Response, next : NextFunction)=>{
        res.render('sales_dashboard')
        
    },
    getAdmin: async (req: Request, res: Response, next : NextFunction)=>{
        
        res.render('admin_dashboard')
        
    },
    endorseUser: async(req: Request, res: Response, next: NextFunction)=>{
        const {email} = req.body
        try{
            const user = await Personnel.findOne({
                where: {email}
            })
            if(!user){
                return res.render('admin_error',{
                    message: "User not found",
                    data: ''
                })
            }
    
            await user.update({endorsed: true})
            return res.render('admin_success',{
                message: "salesman endorsed",
                data: `${user.dataValues.name}`
            })
        }
        catch(err){
            console.error(err)
            res.status(500).json({
                error: err,
                message: 'Internal server error'
            })
        }
    },
    updateUser: async (req: Request, res: Response, next:NextFunction)=>{
        const {email} = req.body
        const updates = req.body
        try{
            const user = await Personnel.findOne({
                where: {email}
            })
            if(!user){
                return res.json({
                    error: 'User not found'
                })
            }
            for(const prop in updates){
                if(!updates[prop]){
                    delete updates[prop]
                }
            }
            await user.update({...user.dataValues,...updates})
            res.json({
                message: "User updated"
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
    logOut: async (req: Request, res: Response, next:NextFunction)=>{
        req.headers.authorization = undefined
        res.clearCookie('token')
        res.redirect('/')
    }

    
}

export default control