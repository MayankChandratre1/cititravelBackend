import stripe from '../config/stripe.config.js';

export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'usd', payment_method_id, description } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount, 
            currency,
            payment_method: payment_method_id,
            description,
            automatic_payment_methods: {
                allow_redirects: 'never',
                enabled: 'true'
            }
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

        res.json({
            success: true,
            status: paymentIntent.status
        });
    } catch (error) {
        console.error('Payment confirmation error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const createRefund = async (req, res) => {
    try {
        const { paymentIntentId, amount } = req.body;

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined // Convert to cents if partial refund
        });

        res.json({
            success: true,
            refundId: refund.id,
            status: refund.status
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
