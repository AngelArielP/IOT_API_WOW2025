const Usuario = require('../models/usuario');

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    try {
        const { nombre, rol, contrasena, idPlanta } = req.body;
        const usuario = new Usuario({
            nombre,
            rol,
            contrasena,
            idPlanta
        });
        await usuario.save();
        res.status(201).json(usuario);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario', error });
    }
};

// Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error });
    }
};
