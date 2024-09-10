const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/database');
const util = require('util');

const query = util.promisify(db.query).bind(db);
const beginTransaction = util.promisify(db.beginTransaction).bind(db);
const commit = util.promisify(db.commit).bind(db);
const rollback = util.promisify(db.rollback).bind(db);

const createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            console.error('Invalid amount:', amount);
            return res.status(400).send({
                error: {
                    message: 'Invalid amount',
                },
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            automatic_payment_methods: { 
                enabled: true 
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
            message: 'Payment intent created successfully',
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        return res.status(400).send({
            error: {
                message: error.message,
            },
        });
    }
};

const webhook = async (req, res) => {
    console.log('Webhook received');

    let data, eventType, status;

    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        console.log('Webhook signing is configured');

        // Retrieve the event from Stripe by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers['stripe-signature'];

        try {
            console.log('Raw body:', req.rawBody);
            console.log('Content-Type:', req.get('Content-Type'));
            console.log('Signature:', signature);
            console.log('Secret:', process.env.STRIPE_WEBHOOK_SECRET);

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
        console.log('💰 Payment captured!');

        const paymentIntent = data.object;
        console.log('Payment Intent details:', paymentIntent);

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

const processOrder = async (req, res) => {
    try {
      const { paymentIntent, cartItems, userEmail, shippingAddress, firstName, lastName, phone } = req.body;
      
      const orderId = await processOrderLogic(paymentIntent, cartItems, userEmail, shippingAddress, firstName, lastName, phone);
      
      res.status(200).json({ message: 'Order processed successfully', orderId });

    } catch (error) {
      console.error('Error processing order:', error);
      res.status(500).json({ error: 'Failed to process order' });
    }
  };


const processOrderLogic = async (
    paymentIntent, cartItems, userEmail, shippingAddress, firstName, lastName, phone
) => {
    console.log(`Updating SPEED DOME database for payment intent: ${paymentIntent.id}`);

    try {
        await beginTransaction();
    
        // 1. Get or create user
        console.log(`Attempting to find user with email: ${userEmail}`);
        const [userRows] = await query(
            'SELECT * FROM Users WHERE Email = ?',
            [userEmail]
        );

        console.log(`User query result:`, userRows);

        let userId;
        if (!userRows || userRows.length === 0) {
            console.log(`User not found. Creating new user with email: ${userEmail}`);

            const [result] = await query(
                'INSERT INTO Users (Email, FirstName, LastName, Phone) VALUES (?, ?, ?, ?)',
                [userEmail, firstName || null, lastName || null, phone || null]
            );
            userId = result.insertId;
            console.log(`New user created with ID: ${userId}`);

        } else {
            userId = userRows[0].ID;
            console.log(`Existing user found with ID: ${userId}`);

            await query(
                'UPDATE Users SET FirstName = ?, LastName = ?, Phone = ? WHERE ID = ?',
                [firstName || null, lastName || null, phone || null, userId]
            );
            console.log(`Updated information for user ID: ${userId}`);
        }

        // 2. Create address
        console.log(`Creating address for user ${userId}`);
        const [addressResult] = await query(
            'INSERT INTO Addresses (UserID, Street, City, State, ZipCode, Country) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, shippingAddress.line1, shippingAddress.city, shippingAddress.state, 
                shippingAddress.postal_code, shippingAddress.country]
          );  
        console.log(`Address created with ID: ${addressResult.insertId}`);
          
        // 3. Create order
        const totalAmount = paymentIntent.amount / 100; // Convert cents to dollars
        const [orderResult] = await query(
        'INSERT INTO Orders (UserID, TotalAmount, Status) VALUES (?, ?, ?)',
        [userId, totalAmount, 'Paid']
        );
        const orderId = orderResult.insertId;

        // 4. Create order items
        for (const item of cartItems) {
            await query(
                'INSERT INTO OrderItems (OrderID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?)',
                [orderId, item.ID, item.quantity, item.Price]
            );
        }
        console.log(`Order items created successfully`);

        // 5. Create payment record
        console.log(`Creating payment record for order ${orderId}`);
        await query(
            'INSERT INTO Payments (OrderID, Amount, PaymentMethod, Status) VALUES (?, ?, ?, ?)',
            [orderId, totalAmount, 'Stripe', 'Completed']
        );

        await commit();

        console.log(`Order processed successfully. Order ID: ${orderId}`);
        return orderId;          

    } catch (error) {
        await rollback();
        console.error('Error processing order:', error);
        console.error('Error stack:', error.stack);
        throw error;
    }
};

const getPaymentStatus = async (req, res) => {
    const paymentIntentId = req.params.paymentIntentId;
    console.log(`Retrieving payment status for payment intent: ${paymentIntentId}`);

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        res.send({
            status: paymentIntent.status,
        });
    } catch (error) {
        console.error('Error retrieving payment intent:', error);
        res.status(400).send({
            error: {
                message: error.message,
            },
        });
    }
};

module.exports = {
    createPaymentIntent,
    webhook,
    processOrder,
    getPaymentStatus,
};
