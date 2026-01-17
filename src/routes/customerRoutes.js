const express = require('express');

const customerController = require('../controllers/customerController');

const router = express.Router();

router.get('/summary', customerController.getSummary);

module.exports = router;
