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
router.get('/', (req, res, next) => {
    res.render('admin_landing');
});
router.get('/signup', (req, res, next) => {
    res.render('admin_signup');
});
router.use('/dashboard/:route', auth_1.default.adminAction);
router.post('/signup', [user_1.default.createAdmin, auth_1.default.adminAction], user_1.default.goToAdmin);
router.post('/dashboard', [auth_1.default.authenticate, auth_1.default.adminAction], user_1.default.getAdmin);
router.get('/dashboard', auth_1.default.adminAction, user_1.default.getAdmin);
router.get('/dashboard/product/create', (req, res, next) => {
    res.render('add_product');
});
router.post('/dashboard/product/create', product_1.default.create);
router.get('/dashboard/product/all', product_1.default.getAll);
router.get('/dashboard/product', product_1.default.getOne);
router.post('/dashboard/product/stockup', product_1.default.restock);
router.patch('/dashboard/product', product_1.default.updatePrice);
router.post('/dashboard/staff/endorsed', user_1.default.endorseUser);
exports.default = router;
