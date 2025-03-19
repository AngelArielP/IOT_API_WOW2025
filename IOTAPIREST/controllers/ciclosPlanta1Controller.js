const CiclosPlanta1 = require('../models/ciclosPlanta1');

// Crear nuevo ciclo de planta
exports.createCicloPlanta1 = async (req, res) => {
    try {
        const { maquina, turnos, fechaCreacion, cicloTotal } = req.body;
        // Validación de datos obligatorios
        if (!maquina || !turnos || !Array.isArray(turnos) || turnos.length === 0 || !fechaCreacion) {
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        // Verificar si ya existe un documento con la misma maquina y fechaCreacion
        const existeCiclo = await CiclosPlanta1.findOne({ maquina, fechaCreacion });

        if (existeCiclo) {
            return res.status(409).json({ message: 'El ciclo para esta máquina y fecha ya existe' });
        }

        // Crear el nuevo ciclo
        const nuevoCiclo = new CiclosPlanta1({
            maquina,
            turnos,
            fechaCreacion,
            cicloTotal
        });

        // Guardar en la base de datos
        const cicloGuardado = await nuevoCiclo.save();
        res.status(201).json(cicloGuardado);
        
    } catch (error) {
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
        const { maquina, tiempoInicio, tiempoFinal, turno, cicloTotalMin, cicloTotalMax } = req.query;

        // Crear un objeto de filtros que se irá construyendo dinámicamente
        let filtros = {};

        // Agregar los filtros según los parámetros recibidos
        if (maquina) filtros.maquina = maquina;
        if (tiempoInicio) filtros.fechacicloinicial = { $gte: new Date(tiempoInicio) };  // Mayor o igual a la fecha proporcionada
        if (tiempoFinal) filtros.fechaciclofinal = { $lte: new Date(tiempoFinal) };  // Menor o igual a la fecha proporcionada
        if (turno) filtros.turno = turno;

        // Filtro por rango de cicloTotal (si se proporcionan)
        if (cicloTotalMin) filtros.cicloTotal = { $gte: parseInt(cicloTotalMin) };
        if (cicloTotalMax) filtros.cicloTotal = { $lte: parseInt(cicloTotalMax) };

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
        const { contadorCiclos, fechaciclofinal, cicloTotal } = req.body; // Obtener los datos para actualizar

        // Buscar el ciclo en la base de datos por el ID
        const ciclo = await CiclosPlanta1.findById(id);

        if (!ciclo) {
            return res.status(404).json({ message: 'Ciclo no encontrado' });
        }

        // Actualizar el ciclo con los nuevos datos
        ciclo.contadorCiclos = contadorCiclos;
        ciclo.fechaciclofinal = fechaciclofinal;
        ciclo.cicloTotal = cicloTotal;  // Actualizar el campo cicloTotal

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
