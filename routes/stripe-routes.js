import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/create-verification', async (req, res) => {
  try {
    const { amount, currency, paymentMethodId } = req.body;
    
    // Create a payment intent with the payment method ID
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      payment_method: paymentMethodId,
      payment_method_types: ['card'],
      capture_method: 'automatic',
      confirm: true, // Automatically confirm since we have all details
      description: 'Card verification charge',
      setup_future_usage: 'off_session', // Allow reuse of this payment method
      return_url: process.env.STRIPE_RETURN_URL, // For 3D Secure
    });

    // Get the payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Return appropriate response based on payment intent status
    if (paymentIntent.status === 'succeeded') {
      // Payment successful, return the payment method ID for future use
      res.json({
        success: true,
        status: 'succeeded',
        paymentMethodId: paymentMethodId,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
        clientSecret: paymentIntent.client_secret
      });
    } else if (paymentIntent.status === 'requires_action') {
      // 3D Secure verification needed
      res.json({
        success: true,
        status: 'requires_action',
        clientSecret: paymentIntent.client_secret,
        nextAction: paymentIntent.next_action,
        paymentMethodId: paymentMethodId,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand
      });
    } else {
      throw new Error('Payment failed');
    }

  } catch (error) {
    console.error('Error creating verification payment:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

// Modify the confirm endpoint to handle 3D Secure results
router.post('/confirm-verification', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Get the payment method details for future use
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
      
      res.json({
        success: true,
        status: 'succeeded',
        paymentMethodId: paymentMethod.id,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand
      });
    } else {
      throw new Error('Payment verification failed');
    }

  } catch (error) {
    console.error('Error confirming verification payment:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Optional: Refund the verification charge if needed
router.post('/refund-verification', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    // Create a refund for the payment
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    
    res.json({
      success: true,
      refundId: refund.id,
      status: refund.status
    });
  } catch (error) {
    console.error('Error refunding verification payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;