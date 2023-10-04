import express, {Request, Response, NextFunction} from 'express';
import authMid from '../auth/auth';
import userControl from '../controller/user';
import prodControl from '../controller/product'


const router = express.Router();

router.get('/', (req:Request, res: Response, next: NextFunction)=>{
    res.render('admin_landing')
})
router.get('/signup', (req:Request, res: Response, next: NextFunction)=>{
    res.render('admin_signup')
})

router.use('/dashboard/:route', authMid.adminAction)
router.post('/signup', [userControl.createAdmin, authMid.adminAction], userControl.goToAdmin)
router.post('/dashboard', [authMid.authenticate, authMid.adminAction], userControl.getAdmin)

router.get('/dashboard',authMid.adminAction ,userControl.getAdmin)
router.get('/dashboard/product/create', (req:Request, res: Response, next:NextFunction)=>{
    res.render('add_product')
})
router.post('/dashboard/product/create', prodControl.create)
router.get('/dashboard/product/all', prodControl.getAll)
router.get('/dashboard/product', prodControl.getOne)
router.post('/dashboard/product/stockup', prodControl.restock)
router.patch('/dashboard/product', prodControl.updatePrice)
router.post('/dashboard/staff/endorsed', userControl.endorseUser)


export default router;
