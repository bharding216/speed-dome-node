const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

// Define your routes
router.get('/', indexController.handleRootRequest);
// router.post('/api/books', indexController.handleBookCreation);
// router.post('/update-waitlist', indexController.handleWaitlistUpdate);
// router.post('/create-account', indexController.handleCreateAccount);
// router.post('/user-auth', indexController.handleUserAuth);

module.exports = router;