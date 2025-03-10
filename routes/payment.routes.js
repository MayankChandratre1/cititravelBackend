import express from 'express';
import { createPaymentIntent, confirmPayment, createRefund } from '../controllers/payment.controller.js';
import auth from '../middlewares/auth-middleware.js';

const router = express.Router();

// Payment routes
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-payment', confirmPayment);
router.post('/create-refund', createRefund);

export default router;
