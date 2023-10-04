"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const user_1 = __importDefault(require("../controller/user"));
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});
router.post('/', user_1.default.logOut);
exports.default = router;
