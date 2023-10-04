"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const valid_1 = require("./valid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const personnel_1 = require("../model/personnel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
(0, dotenv_1.config)();
const auth = {
    authenticate: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        req.headers.authorization = undefined;
        res.clearCookie('token');
        req.cookies.token = undefined;
        //validate user input
        const { error, value } = valid_1.loginValidate.validate(req.body);
        //pass to next middleware if input is invalid
        if (error) {
            next();
        }
        try {
            const { email, password } = value;
            //find user by email given
            const personnel = yield personnel_1.Personnel.findOne({
                where: { email }
            });
            //return error if user not found
            if (!personnel) {
                return res.status(403).render('bad_login', {
                    message: 'wrong email or password',
                    data: ''
                });
            }
            //compare encrypted password
            const match = bcryptjs_1.default.compareSync(password, personnel.dataValues.password);
            //respond with error if password does not match
            if (!match) {
                return res.status(403).render('bad_login', {
                    message: 'wrong email or password',
                    data: ''
                });
            }
            //generate a token on successful credentials
            const token = jsonwebtoken_1.default.sign({
                userid: personnel.dataValues.id,
                endorsed: personnel.dataValues.endorsed,
                admin: personnel.dataValues.admin
            }, process.env.JWT_SECRET, { expiresIn: "1h" });
            //to be removed, token is sensitive info
            console.log(token);
            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
            //attach token to req headers and pass to next
            req.headers = Object.assign(Object.assign({}, req.headers), { authorization: `Bearer ${token}` });
            console.log('from authenticate');
            console.log(req.headers);
            next();
        }
        catch (err) {
            console.error(err);
            res.status(500).json({
                error: err
            });
        }
    }),
    authorize: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        //retrieve token from request headers
        let authHead = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!authHead) {
            authHead = req.cookies.token;
        }
        console.log('from authorise');
        console.log(authHead);
        //return error if token does not exist or invalid format
        if (!authHead) {
            return res.status(403).render('bad_login', {
                message: 'wrong email or password',
                data: ''
            });
        }
        //split to obtain token
        const token = authHead;
        try {
            //decrypt token and pass to next if valid
            const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            next();
        }
        catch (err) {
            res.status(401).render('bad_login', {
                message: 'Unauthorised',
                data: ''
            });
        }
    }),
    endorsed: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        //retrieve token from request headers
        let authHead = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(' ')[1];
        if (!authHead) {
            authHead = req.cookies.token;
        }
        //return error if token does not exist or invalid format
        if (!authHead) {
            return res.status(403).render('bad_login', {
                message: 'wrong email or password',
                data: ''
            });
        }
        //split to obtain token
        const token = authHead;
        try {
            //decrypt token to get endorsed status
            const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            //pass to next if endorsed
            if (decode.endorsed) {
                next();
                return;
            }
            //respond with message if not endorsed
            res.status(403).render('not_endorsed', {
                message: 'You are not endorsed',
                data: 'Only admins can endorse users'
            });
        }
        catch (err) {
            res.status(401).render('bad_login', {
                message: 'Session lost. Please login',
                data: ''
            });
        }
    }),
    adminAction: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        //retrieve token from request headers
        let authHead = (_c = req.headers.authorization) === null || _c === void 0 ? void 0 : _c.split(' ')[1];
        if (!authHead) {
            authHead = req.cookies.token;
        }
        console.log('from admin action');
        console.log(authHead);
        //return error if token does not exist or invalid format
        if (!authHead) {
            return res.status(403).render('bad_login', {
                message: 'Session lost. Please login',
                data: ''
            });
        }
        //split to obtain token
        const token = authHead;
        try {
            //decode to obtain admin status
            const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            //pass to next if admin
            if (decode.admin) {
                next();
                return;
            }
            //respond with error if not admin
            res.status(403).render('bad_login', {
                message: 'Forbidden',
                data: 'Only admins can perform this action'
            });
        }
        catch (err) {
            console.error(err);
            res.status(401).render('bad_login', {
                message: 'Session lost. Please login',
                data: ''
            });
        }
    })
};
exports.default = auth;
