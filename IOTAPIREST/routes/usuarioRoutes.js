const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/', usuarioController.createUsuario);
router.get('/', usuarioController.getUsuarios);

module.exports = router;
