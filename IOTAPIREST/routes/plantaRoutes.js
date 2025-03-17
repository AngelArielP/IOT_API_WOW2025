const express = require('express');
const router = express.Router();
const plantaController = require('../controllers/plantaController');

router.post('/', plantaController.createPlanta);
router.get('/', plantaController.getPlantas);

module.exports = router;
