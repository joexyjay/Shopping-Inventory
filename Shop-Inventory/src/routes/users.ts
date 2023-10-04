import express, {Request, Response, NextFunction} from 'express';
import authMid from '../auth/auth';
import userControl from '../controller/user';
import prodControl from '../controller/product'
import auth from '../auth/auth';
const router = express.Router();

/* GET users listing. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.render('sales_landing');
});
router.use('/dashboard/sale', authMid.endorsed)
router.use('/dashboard/:route', authMid.authorize)
router.post('/signup', [userControl.create, authMid.authorize], userControl.newUser)
router.get('/signup', (req:Request, res:Response, next: NextFunction)=>{
  res.render('sales_signup')
})
router.post('/dashboard',[authMid.authenticate, authMid.authorize] ,userControl.get)
router.get('/dashboard', authMid.authorize, userControl.get)
router.get('/dashboard/product/all', prodControl.getAllSalesman)
router.post('/dashboard/sale', prodControl.makeSale)
router.get('/dashboard/sale', (req:Request, res:Response, next:NextFunction)=>{
  res.render('make_sale')
})
router.post('/dashboard/product', prodControl.getOne)


export default router;
