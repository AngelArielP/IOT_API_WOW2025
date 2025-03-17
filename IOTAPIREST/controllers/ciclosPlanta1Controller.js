const CiclosPlanta1 = require('../models/ciclosPlanta1');

// Crear nuevo ciclo de planta
exports.createCicloPlanta1 = async (req, res) => {
    try {
        const { maquina, contadorCiclos, turno, fechacicloinicial, duracion, fechaciclofinal, fechaCreacion } = req.body;

        // Crear nuevo ciclo directamente con los datos recibidos
        const cicloPlanta1 = new CiclosPlanta1({
            maquina, contadorCiclos, turno, fechacicloinicial, duracion, fechaciclofinal, fechaCreacion
        });

        // Guardar el nuevo ciclo
        await cicloPlanta1.save();

        // Responder con el ciclo creado
        res.status(201).json(cicloPlanta1);
    } catch (error) {
        // En caso de error, devolver el error al cliente
        res.status(500).json({ message: 'Error al crear ciclo de planta', error });
    }
};

// Obtener ciclos de planta
exports.getCiclosPlanta1 = async (req, res) => {
    try {
        const ciclos = await CiclosPlanta1.find();
        res.status(200).json(ciclos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ciclos de planta', error });
    }
};

// Buscar ciclos de planta
exports.searchCiclosPlanta1 = async (req, res) => {
    try {
        // Obtener los parámetros de búsqueda de la consulta (query string)
        const { maquina, tiempoInicio, tiempoFinal, turno } = req.query;

        // Crear un objeto de filtros que se irá construyendo dinámicamente
        let filtros = {};

        // Agregar los filtros según los parámetros recibidos
        if (maquina) filtros.maquina = maquina;
        if (tiempoInicio) filtros.tiempoInicio = { $gte: new Date(tiempoInicio) };  // Mayor o igual a la fecha proporcionada
        if (tiempoFinal) filtros.tiempoFinal = { $lte: new Date(tiempoFinal) };  // Menor o igual a la fecha proporcionada
        if (turno) filtros.turno = turno;

        // Buscar los ciclos que coincidan con los filtros
        const ciclos = await CiclosPlanta1.find(filtros);

        // Responder con los ciclos encontrados
        res.status(200).json(ciclos);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar ciclos de planta', error });
    }
};

// Actualizar ciclo existente
exports.updateCicloPlanta1 = async (req, res) => {
    try {
        const { id } = req.params; // Obtener el ID del ciclo de la URL
        const { contadorCiclos, fechaciclofinal } = req.body; // Obtener los datos para actualizar

        // Buscar el ciclo en la base de datos por el ID
        const ciclo = await CiclosPlanta1.findById(id);

        if (!ciclo) {
            return res.status(404).json({ message: 'Ciclo no encontrado' });
        }

        // Actualizar el ciclo con los nuevos datos
        ciclo.contadorCiclos = contadorCiclos;
        ciclo.fechaciclofinal = fechaciclofinal;

        // Guardar los cambios en la base de datos
        await ciclo.save();

        // Responder con el ciclo actualizado
        res.status(200).json({
            message: 'Ciclo actualizado exitosamente',
            data: ciclo
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar ciclo de planta', error });
    }
};