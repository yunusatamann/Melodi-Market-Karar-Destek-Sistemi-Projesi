const express = require('express');

const stockController = require('../controllers/stockController');

const router = express.Router();

router.get('/summary', stockController.getSummary);
router.put('/:id', stockController.updateProduct);
router.delete('/:id', stockController.deleteProduct);
module.exports = router;
