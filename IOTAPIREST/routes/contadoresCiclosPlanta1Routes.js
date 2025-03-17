const express = require('express');
const router = express.Router();
const contadoresCiclosPlanta1Controller = require('../controllers/contadoresCiclosPlanta1Controller');

router.post('/', contadoresCiclosPlanta1Controller.createContadorCiclosPlanta1);
router.get('/', contadoresCiclosPlanta1Controller.getContadoresCiclosPlanta1);

module.exports = router;
