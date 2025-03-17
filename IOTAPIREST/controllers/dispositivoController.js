const Dispositivo = require('../models/dispositivo');

// Crear un nuevo dispositivo
exports.createDispositivo = async (req, res) => {
    try {
        const { nombreDispositivo, idPlanta, numeroTags } = req.body;
        const dispositivo = new Dispositivo({
            nombreDispositivo,
            idPlanta,
            numeroTags
        });
        await dispositivo.save();
        res.status(201).json(dispositivo);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear dispositivo', error });
    }
};

// Obtener todos los dispositivos
exports.getDispositivos = async (req, res) => {
    try {
        const dispositivos = await Dispositivo.find().populate('idPlanta');
        res.status(200).json(dispositivos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener dispositivos', error });
    }
};
