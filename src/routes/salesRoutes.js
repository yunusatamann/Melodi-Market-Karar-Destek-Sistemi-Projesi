const express = require('express');

const salesController = require('../controllers/salesController');

const router = express.Router();

router.get('/summary', salesController.getSummary);
router.get('/yearly-stats', salesController.getYearlyStats);
router.post('/', salesController.createSale);
module.exports = router;
