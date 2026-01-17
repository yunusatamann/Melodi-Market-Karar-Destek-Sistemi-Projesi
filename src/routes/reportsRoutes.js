const express = require('express');

const reportsController = require('../controllers/reportsController');

const router = express.Router();

router.get('/summary', reportsController.getSummary);

module.exports = router;
