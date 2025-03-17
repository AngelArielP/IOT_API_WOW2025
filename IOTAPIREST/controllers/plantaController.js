const Planta = require('../models/planta');

// Crear una nueva planta
exports.createPlanta = async (req, res) => {
    try {


        const { nombrePlanta, fechaAlta, areasDeLaPlanta, idPlanta, EwonMqtt, idEwon, empresanombre } = req.body;
        const planta = new Planta({
            nombrePlanta, fechaAlta, areasDeLaPlanta, idPlanta, EwonMqtt, idEwon, empresanombre
        });
        await planta.save();
        res.status(201).json(planta);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear planta', error });
    }
};

// Obtener todas las plantas
exports.getPlantas = async (req, res) => {
    try {
        const plantas = await Planta.find();
        res.status(200).json(plantas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener plantas', error });
    }
};
