const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            // amount: req.body.amount,
            amount: 1099,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });

        console.log('Payment intent:', paymentIntent)
        console.log('Payment intent client secret:', paymentIntent.client_secret)

        res.send({
            clientSecret: paymentIntent.client_secret,
            message: 'Payment intent created successfully',
        });

    } catch (error) {
        console.error('Error fetching product by ID:', error);
        return res.status(400).send({
            error: {
                message: error.message,
            },
        });
    }
};

const webhook = async (req, res) => {
    let data, eventType, status;

    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        console.log('Webhook signing is configured');

        // Retrieve the event from Stripe by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers['stripe-signature'];

        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }
        data = event.data;
        eventType = event.type;
        console.log('Event data:', data);
        console.log('Event type:', eventType);
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // we can retrieve the event data directly from the request body.
      data = req.body.data;
      eventType = req.body.type;
    }
  
    if (eventType === 'payment_intent.succeeded') {
        // Funds have been captured
        // Fulfill any orders, e-mail receipts, etc
        console.log('💰 Payment captured!');
        // Update payment status in database
        status = 'success';
    } else if (eventType === 'payment_intent.payment_failed') {
        console.log('❌ Payment failed.');
        status = 'failed';
    } else {
        status = 'unknown';
    }

    console.log('Status:', status);
    res.json({ received: true, status: status });
};


module.exports = {
    createPaymentIntent,
    webhook,
};
