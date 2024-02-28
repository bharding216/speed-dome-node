const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/webhook', paymentController.webhook);

module.exports = router;
