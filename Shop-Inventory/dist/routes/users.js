"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../auth/auth"));
const user_1 = __importDefault(require("../controller/user"));
const product_1 = __importDefault(require("../controller/product"));
const router = express_1.default.Router();
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('sales_landing');
});
router.use('/dashboard/sale', auth_1.default.endorsed);
router.use('/dashboard/:route', auth_1.default.authorize);
router.post('/signup', [user_1.default.create, auth_1.default.authorize], user_1.default.newUser);
router.get('/signup', (req, res, next) => {
    res.render('sales_signup');
});
router.post('/dashboard', [auth_1.default.authenticate, auth_1.default.authorize], user_1.default.get);
router.get('/dashboard', auth_1.default.authorize, user_1.default.get);
router.get('/dashboard/product/all', product_1.default.getAllSalesman);
router.post('/dashboard/sale', product_1.default.makeSale);
router.get('/dashboard/sale', (req, res, next) => {
    res.render('make_sale');
});
router.post('/dashboard/product', product_1.default.getOne);
exports.default = router;
