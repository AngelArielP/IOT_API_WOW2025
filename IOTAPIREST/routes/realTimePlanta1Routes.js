const express = require('express');
const router = express.Router();
const RealTimePlanta1Controller = require('../controllers/realTimePlanta1Controller');

// Crear nuevo registro
router.post('/', RealTimePlanta1Controller.createRealTimePlanta1);

// Obtener todos los registros
router.get('/', RealTimePlanta1Controller.getRealTimePlanta1);

// Obtener registros por fecha
router.get('/fecha', RealTimePlanta1Controller.getRealTimePlanta1ByFecha);

// Obtener registros por tag
router.get('/maquina', RealTimePlanta1Controller.getRealTimePlanta1ByMaquina);

// Obtener registros por tag y fecha
router.get('/maquina-fecha', RealTimePlanta1Controller.getRealTimePlanta1ByMaquinaYFecha);


module.exports = router;
