const RealTimePlanta1 = require('../models/realTimePlanta1');

// Crear nuevo registro en RealTimePlanta1
exports.createRealTimePlanta1 = async (req, res) => {
    try {
        const { maquina, data, timestamp } = req.body;
        const fecha = new Date().toISOString().split('T')[0]; // Esto elimina la parte de la hora

        // Validar que los datos recibidos sean correctos
        if (!maquina || !data || !Array.isArray(data)) {
            return res.status(400).json({ message: 'Maquina y data son requeridos y data debe ser un arreglo' });
        }

        // Convertir los valores de 'value' a números (si no lo son ya)
        const formattedData = data.map(item => ({
            tag: item.tag,
            value: Number(item.value)  // Convertir 'value' a número
        }));
        // Si el timestamp no es pasado en la solicitud, se usa el valor predeterminado
        const newTimestamp = timestamp ? new Date(timestamp) : undefined;

        // Crear un nuevo registro en la base de datos
        const realTimeData = new RealTimePlanta1({
            maquina,
            data: formattedData,  // Usar los datos con valores convertidos
            timestamp: newTimestamp || Date.now(),
            fecha: fecha,  // Usamos la fecha formateada

        });

        // Guardar el registro en la base de datos
        await realTimeData.save();

        // Enviar una respuesta exitosa
        res.status(201).json(realTimeData);
    } catch (error) {
        console.error('Error al crear RealTimePlanta1:', error);
        res.status(500).json({ message: 'Error al crear RealTimePlanta1', error });
    }
};


// Obtener registros de RealTimePlanta1
exports.getRealTimePlanta1 = async (req, res) => {
    try {
        const registros = await RealTimePlanta1.find();
        res.status(200).json(registros);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener registros RealTimePlanta1', error });
    }
};

// Obtener registros por fecha
exports.getRealTimePlanta1ByFecha = async (req, res) => {
    try {
        const { fecha } = req.query; // Fecha debe ser pasada como parámetro en la query
        if (!fecha) {
            return res.status(400).json({ message: 'La fecha es requerida en el parámetro "fecha"' });
        }

        // Buscar los registros por fecha
        const registros = await RealTimePlanta1.find({ fecha });

        if (registros.length === 0) {
            return res.status(404).json({ message: 'No se encontraron registros para esta fecha' });
        }

        res.status(200).json(registros);
    } catch (error) {
        console.error('Error al obtener registros por fecha:', error);
        res.status(500).json({ message: 'Error al obtener registros por fecha', error });
    }
};

// Filtrar por "maquina"
exports.getRealTimePlanta1ByMaquina = async (req, res) => {
    try {
        const { maquina } = req.query;  // Obtener el valor de 'maquina' de los parámetros de consulta
        const registros = await RealTimePlanta1.find({ maquina: maquina })
        .sort({ timestamp: -1 }) // Ordenar por fecha de forma descendente
        .limit(1); // Limitar a un solo documento (el más reciente)
            res.status(200).json(registros);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener registros por máquina', error });
    }
};

// Filtrar por "maquina" y "fecha"
exports.getRealTimePlanta1ByMaquinaYFecha = async (req, res) => {
    try {
        const { maquina, fecha } = req.query;  // Obtener 'maquina' y 'fecha' de los parámetros de consulta
        const registros = await RealTimePlanta1.find({ maquina: maquina })
            .sort({ timestamp: -1 }) // Ordenar por fecha de forma descendente
            .limit(1); // Limitar a un solo documento (el más reciente)
        
        res.status(200).json(registros);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener registros por máquina y fecha', error });
    }
};

