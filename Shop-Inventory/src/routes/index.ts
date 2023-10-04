import express, {Request, Response, NextFunction} from 'express';
const router = express.Router();
import userControl from '../controller/user'

/* GET home page. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.render('index');
});

router.post('/', userControl.logOut)


export default router;

