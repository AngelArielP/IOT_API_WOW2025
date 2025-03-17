const express = require('express');
const router = express.Router();
const ciclosPlanta1Controller = require('../controllers/ciclosPlanta1Controller');

router.post('/insertar', ciclosPlanta1Controller.createCicloPlanta1);
router.get('/', ciclosPlanta1Controller.getCiclosPlanta1);
router.get('/search', ciclosPlanta1Controller.searchCiclosPlanta1);
router.put('/actualizar/:id', ciclosPlanta1Controller.updateCicloPlanta1);

module.exports = router;
