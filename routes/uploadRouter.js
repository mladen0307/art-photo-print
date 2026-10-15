const express = require('express');
const uploadController = require('./../controllers/uploadController');

const router = express.Router();

router.post('/signature', uploadController.createUploadSignature);

module.exports = router;
