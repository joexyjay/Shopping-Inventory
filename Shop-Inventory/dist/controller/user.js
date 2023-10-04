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
const valid_1 = __importDefault(require("../auth/valid"));
const uuid_1 = require("uuid");
const personnel_1 = require("../model/personnel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
(0, dotenv_1.config)();
const control = {
    createAdmin: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const userInput = req.body;
        const { error, value } = valid_1.default.validate(userInput);
        if (error) {
            next();
            return;
        }
        const { email, password, name, adminkey } = value;
        const id = (0, uuid_1.v4)();
        const salt = 10;
        try {
            const hash = bcryptjs_1.default.hashSync(password, salt);
            if (adminkey === process.env.ADMINKEY) {
                const personnel = yield personnel_1.Personnel.create({
                    id,
                    name,
                    email,
                    password: hash,
                    admin: true,
                    endorsed: true,
                });
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
                next();
                return;
            }
            res.status(400).render('bad_login', {
                message: 'Invalid credentials',
                data: ''
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error',
                error: err
            });
        }
    }),
    create: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const userInput = Object.assign(Object.assign({}, req.body), { adminkey: null });
        const { error, value } = valid_1.default.validate(userInput);
        if (error) {
            res.status(400).json({
                message: 'Internal server error',
                error: error
            });
            return;
        }
        const { email, password, name } = value;
        const id = (0, uuid_1.v4)();
        const salt = 10;
        try {
            const hash = bcryptjs_1.default.hashSync(password, salt);
            const personnel = yield personnel_1.Personnel.create({
                id,
                name,
                email,
                password: hash,
                admin: false,
                endorsed: false,
            });
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
            next();
            return;
        }
        catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error',
                error: err
            });
        }
    }),
    newUser: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        res.redirect('/users/dashboard');
    }),
    goToAdmin: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        res.redirect('/admin/dashboard');
    }),
    get: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        res.render('sales_dashboard');
    }),
    getAdmin: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        res.render('admin_dashboard');
    }),
    endorseUser: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        try {
            const user = yield personnel_1.Personnel.findOne({
                where: { email }
            });
            if (!user) {
                return res.render('admin_error', {
                    message: "User not found",
                    data: ''
                });
            }
            yield user.update({ endorsed: true });
            return res.render('admin_success', {
                message: "salesman endorsed",
                data: `${user.dataValues.name}`
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({
                error: err,
                message: 'Internal server error'
            });
        }
    }),
    updateUser: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        const updates = req.body;
        try {
            const user = yield personnel_1.Personnel.findOne({
                where: { email }
            });
            if (!user) {
                return res.json({
                    error: 'User not found'
                });
            }
            for (const prop in updates) {
                if (!updates[prop]) {
                    delete updates[prop];
                }
            }
            yield user.update(Object.assign(Object.assign({}, user.dataValues), updates));
            res.json({
                message: "User updated"
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'internal server error',
                error: err
            });
        }
    }),
    logOut: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        req.headers.authorization = undefined;
        res.clearCookie('token');
        res.redirect('/');
    })
};
exports.default = control;
