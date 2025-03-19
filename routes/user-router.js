import express from 'express';
import { getItinirary, getUser } from '../controllers/user-controller.js';

const router = express.Router()

router.get('/getuser', getUser);
router.get('/getItinirary', getItinirary);
router.get('/getBooking', getUser);
router.get('/getRentals', getUser);



export default router;