"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidate = void 0;
const joi_1 = __importDefault(require("joi"));
const userSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().required(),
    password: joi_1.default.string().min(6).max(50).required(),
    adminkey: joi_1.default.string().allow(null).required()
});
const loginValidate = joi_1.default.object({
    email: joi_1.default.string().required(),
    password: joi_1.default.string().min(6).max(50).required()
});
exports.loginValidate = loginValidate;
exports.default = userSchema;
