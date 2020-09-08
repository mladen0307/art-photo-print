const express = require('express');
const orderController = require('./../controllers/orderController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/').post(orderController.createOrder);
router.route('/').get(authController.protect, orderController.getAllOrders);

router
  .route('/:id')
  .get(authController.protect, orderController.getOrder)
  .patch(authController.protect, orderController.updateOrder)
  .delete(authController.protect, orderController.deleteOrder);

router
  .route('/:id/sendEmail')
  .get(authController.protect, orderController.sendEmail);
module.exports = router;
