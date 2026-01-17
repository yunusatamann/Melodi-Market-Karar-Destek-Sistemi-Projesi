const express = require('express');

const scenarioController = require('../controllers/scenarioController');

const router = express.Router();

router.get('/summary', scenarioController.getSummary);
router.post('/simulate', scenarioController.simulate);

module.exports = router;
