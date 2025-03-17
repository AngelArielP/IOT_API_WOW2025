const express = require('express');
const router = express.Router();
const dispositivoController = require('../controllers/dispositivoController');

router.post('/', dispositivoController.createDispositivo);
router.get('/', dispositivoController.getDispositivos);

module.exports = router;
