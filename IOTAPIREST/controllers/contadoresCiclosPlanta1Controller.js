const ContadoresCiclosPlanta1 = require('../models/contadoresCiclosPlanta1');

// Crear nuevo contador de ciclos
exports.createContadorCiclosPlanta1 = async (req, res) => {
    try {
        const { Maquina, contadorCiclos, turno } = req.body;
        const contador = new ContadoresCiclosPlanta1({
            Maquina,
            contadorCiclos,
            turno
        });
        await contador.save();
        res.status(201).json(contador);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear contador de ciclos', error });
    }
};

// Obtener contadores de ciclos
exports.getContadoresCiclosPlanta1 = async (req, res) => {
    try {
        const contadores = await ContadoresCiclosPlanta1.find();
        res.status(200).json(contadores);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener contadores de ciclos', error });
    }
};
