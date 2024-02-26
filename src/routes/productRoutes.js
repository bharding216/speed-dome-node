const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
// router.post('/', userController.createUser);
// router.put('/:userId', userController.updateUser);
// router.delete('/:userId', userController.deleteUser);

module.exports = router;
