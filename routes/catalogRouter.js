const express = require('express');
const catalogController = require('./../controllers/catalogController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(catalogController.getCatalog)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    catalogController.updateCatalog
  );

module.exports = router;
