const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);
router.get('/payment-status/:paymentIntentId', paymentController.getPaymentStatus);

module.exports = router;
