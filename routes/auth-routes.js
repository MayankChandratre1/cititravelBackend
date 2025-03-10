import express from 'express';
import { login, register, sendOtpEmail, verify } from '../controllers/auth-controller.js';

const router = express.Router()

router.post('/send-verification-email', sendOtpEmail)
router.post('/verify', verify)
router.post('/register', register)
router.post('/login', login)


export default router;