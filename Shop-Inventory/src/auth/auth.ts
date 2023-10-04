import { config } from "dotenv";
import { Request, Response, NextFunction } from "express";
import { loginValidate } from "./valid";
import jwt from 'jsonwebtoken'
import { v4 as uuid} from 'uuid'
import { Personnel } from "../model/personnel";
import bcrypt from 'bcryptjs'

config()

interface Decode{
    userid?: string;
    endorsed?: boolean;
    admin?:boolean
    iat?: number;
    exp?: number;
}

const auth = {
    authenticate: async (req: Request, res: Response, next: NextFunction)=>{
        req.headers.authorization = undefined
        res.clearCookie('token')
        req.cookies.token = undefined
        //validate user input
        const {error, value} = loginValidate.validate(req.body)

        //pass to next middleware if input is invalid
        if(error){
            next()
        }
        try{
            const {email, password} = value

            //find user by email given
            const personnel = await Personnel.findOne({
                where: {email}
            })

            //return error if user not found
            if(!personnel){
                return res.status(403).render('bad_login',{
                    message: 'wrong email or password',
                    data: ''
                })
            }

            //compare encrypted password
            const match = bcrypt.compareSync(password, personnel.dataValues.password)

            //respond with error if password does not match
            if(!match){
                return res.status(403).render('bad_login',{
                    message: 'wrong email or password',
                    data: ''
                })
            }

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
            console.log('from authenticate')
            console.log(req.headers)
            next()

        }
        catch(err){
            console.error(err)
            res.status(500).json({
                error: err
            })

        } 
    },
    authorize: async (req: Request, res: Response, next:NextFunction)=>{
        //retrieve token from request headers
        let authHead = req.headers.authorization?.split(' ')[1]
        if(!authHead){
            authHead = req.cookies.token
        }

        console.log('from authorise')
        console.log(authHead)
        //return error if token does not exist or invalid format
        if(!authHead){
            return res.status(403).render('bad_login',{
                message: 'wrong email or password',
                data: ''
            }) 
        }

        //split to obtain token
        const token = authHead;
        try{

            //decrypt token and pass to next if valid
            const decode = jwt.verify(token, process.env.JWT_SECRET!) as Decode

            next()
        }
        catch(err){
            res.status(401).render('bad_login',{
                message: 'Unauthorised',
                data: ''
            }) 
        }
    },
    endorsed: async (req:Request, res:Response, next: NextFunction)=>{
        //retrieve token from request headers
        let authHead = req.headers.authorization?.split(' ')[1]
        if(!authHead){
            authHead = req.cookies.token
        }


        //return error if token does not exist or invalid format
        if(!authHead){
            return res.status(403).render('bad_login',{
                message: 'wrong email or password',
                data: ''
            }) 
        }

        //split to obtain token
        const token = authHead;
        try{

            //decrypt token to get endorsed status
            const decode = jwt.verify(token, process.env.JWT_SECRET!) as Decode

            //pass to next if endorsed
            if(decode.endorsed){
                next()
                return
            }

            //respond with message if not endorsed
            res.status(403).render('not_endorsed',{
                message: 'You are not endorsed',
                data: 'Only admins can endorse users'
            })
            
            
        }
        catch(err){
            res.status(401).render('bad_login',{
                message: 'Session lost. Please login',
                data: ''
            }) 
        }
        
    },
    adminAction: async (req:Request, res:Response, next: NextFunction)=>{
        //retrieve token from request headers
        let authHead = req.headers.authorization?.split(' ')[1]
        if(!authHead){
            authHead = req.cookies.token
        }
        
        console.log('from admin action')
        console.log(authHead)
        //return error if token does not exist or invalid format
        if(!authHead){
            return res.status(403).render('bad_login',{
                message: 'Session lost. Please login',
                data: ''
            })  
        }

        //split to obtain token
        const token = authHead;
        try{

            //decode to obtain admin status
            const decode = jwt.verify(token, process.env.JWT_SECRET!) as Decode

            //pass to next if admin
            if(decode.admin){
                next()
                return
            }


            
            //respond with error if not admin
            res.status(403).render('bad_login',{
                message: 'Forbidden',
                data: 'Only admins can perform this action'
            })
            
            
        }
        catch(err){
            console.error(err)
            res.status(401).render('bad_login',{
                message: 'Session lost. Please login',
                data: ''
            }) 
        }
    }
}

export default auth