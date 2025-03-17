const { MongoClient } = require('mongodb');
const WebSocket = require('ws'); // Importamos la librería WebSocket
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz'); // Importamos funciones para manejar zonas horarias

const url = "mongodb://admin:adminpassword@91.134.75.7:27017"; // URL de MongoDB
const dbName1 = 'RealtimePlanta1'; // Base de datos principal
const dbName2 = 'Ciclos'; // Base de datos de ciclos
const dbName3 = 'Tiempos'; // Base de datos de eventos

// Crea la instancia de MongoDB
const client = new MongoClient(url, { useUnifiedTopology: true });
let db1, db2, db3;

// Conectar a la base de datos
async function conectarDB() {
    try {
        await client.connect();
        console.log('Conectado correctamente a MongoDB');
        db1 = client.db(dbName1);
        db2 = client.db(dbName2);
        db3 = client.db(dbName3);
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
    }
}

// Crear servidor WebSocket
const server = require('http').createServer();
const wss = new WebSocket.Server({ server });

// WebSocket: Escucha las conexiones entrantes
wss.on('connection', (ws) => {
    console.log('Nuevo cliente conectado al WebSocket');

    // Enviar un mensaje de bienvenida cuando se conecta
    ws.send(JSON.stringify({ message: 'Conectado al servidor WebSocket' }));

    // Manejar la recepción de datos de los clientes
    ws.on('message', async (message) => {
        try {
            const { type, db, collection, tag, fecha, intervalo } = JSON.parse(message);

            // Procesar las solicitudes de WebSocket
            if (type === 'fetchDocuments') {
                if (!db || !collection || !tag || !fecha) {
                    ws.send(JSON.stringify({ error: 'Faltan parámetros en la solicitud. Asegúrese de incluir db, collection, tag y fecha.' }));
                    return;
                }

                const fechaInicio = new Date(fecha);
                if (isNaN(fechaInicio.getTime())) {
                    ws.send(JSON.stringify({ error: 'Fecha inválida. Asegúrese de que el formato sea yyyy-mm-dd.' }));
                    return;
                }

                let dbSeleccionada;
                switch (db) {
                    case 'RealtimePlanta1':
                        dbSeleccionada = db1;
                        break;
                    case 'Ciclos':
                        dbSeleccionada = db2;
                        break;
                    case 'Tiempos':
                        dbSeleccionada = db3;
                        break;
                    default:
                        ws.send(JSON.stringify({ error: 'Base de datos no válida.' }));
                        return;
                }

                const coleccion = dbSeleccionada.collection(collection);
                const documentos = await coleccion.find({
                    timestamp: { $gte: fechaInicio },
                    "data.tag": tag
                }).sort({ timestamp: 1 }).toArray();

                const resultado = documentos.map(doc => {
                    const dataFiltrada = doc.data.find(item => item.tag === tag);
                    return dataFiltrada ? { timestamp: doc.timestamp, tag: dataFiltrada.tag, value: dataFiltrada.value } : null;
                }).filter(item => item !== null);

                if (resultado.length > 0) {
                    ws.send(JSON.stringify({ message: 'Documentos encontrados', data: resultado }));
                } else {
                    ws.send(JSON.stringify({ message: `No se encontraron documentos para el tag "${tag}" después de la fecha "${fecha}"` }));
                }
            }
            // Lógica para obtener nuevos datos basados en el timestamp
            if (type === 'fetchNewData') {
                if (!timestamp || !db || !collection || !tag) {
                    ws.send(JSON.stringify({ error: 'Faltan parámetros en la solicitud. Asegúrese de incluir timestamp, db, collection y tag.' }));
                    return;
                }

                const fechaInicio = new Date(timestamp); // Usamos el timestamp para buscar nuevos datos
                if (isNaN(fechaInicio.getTime())) {
                    ws.send(JSON.stringify({ error: 'Timestamp inválido. Asegúrese de que el formato sea yyyy-mm-ddThh:mm:ssZ.' }));
                    return;
                }

                let dbSeleccionada;
                switch (db) {
                    case 'RealtimePlanta1':
                        dbSeleccionada = db1;
                        break;
                    case 'Ciclos':
                        dbSeleccionada = db2;
                        break;
                    case 'Tiempos':
                        dbSeleccionada = db3;
                        break;
                    default:
                        ws.send(JSON.stringify({ error: 'Base de datos no válida.' }));
                        return;
                }

                const coleccion = dbSeleccionada.collection(collection);

                // Buscamos los nuevos datos después del timestamp
                const nuevosDocumentos = await coleccion.find({
                    timestamp: { $gt: fechaInicio },
                    "data.tag": tag
                }).sort({ timestamp: 1 }).toArray();

                if (nuevosDocumentos.length > 0) {
                    const resultado = nuevosDocumentos.map(doc => {
                        const dataFiltrada = doc.data.find(item => item.tag === tag);
                        return dataFiltrada ? { timestamp: doc.timestamp, tag: dataFiltrada.tag, value: dataFiltrada.value } : null;
                    }).filter(item => item !== null);

                    // Enviar los nuevos datos encontrados
                    ws.send(JSON.stringify({ message: 'Nuevos datos encontrados', data: resultado }));
                } else {
                    ws.send(JSON.stringify({ message: 'No se encontraron nuevos datos.' }));
                }
            }

            if (type === 'fetchEventos') {
                if (!db || !collection || !tag || !fecha) {
                    ws.send(JSON.stringify({ error: 'Faltan parámetros en la solicitud. Asegúrese de incluir db, collection, tag y fecha.' }));
                    return;
                }

                const fechaInicio = new Date(fecha);
                if (isNaN(fechaInicio.getTime())) {
                    ws.send(JSON.stringify({ error: 'Fecha inválida. Asegúrese de que el formato sea yyyy-mm-dd.' }));
                    return;
                }

                let dbSeleccionada;
                if (db === 'Tiempos' && collection === 'Eventos') {
                    dbSeleccionada = db3; // Solo aceptamos 'Tiempos' y 'Eventos' para este tipo
                } else {
                    ws.send(JSON.stringify({ error: 'Base de datos o colección no válidas para obtener eventos.' }));
                    return;
                }

                const coleccion = dbSeleccionada.collection(collection);
                const eventos = await coleccion.find({
                    "inicio": { $gte: fechaInicio },
                    "tag": tag
                }).sort({ "inicio": -1 }).toArray();

                if (eventos.length > 0) {
                    ws.send(JSON.stringify({ message: 'Eventos encontrados', data: eventos }));
                } else {
                    ws.send(JSON.stringify({ message: `No se encontraron eventos para el tag "${tag}" después de la fecha "${fecha}"` }));
                }
            }

            if (type === 'fetchCiclos') {
                try {
                    if (!db || !collection || !tag) {
                        ws.send(JSON.stringify({ error: 'Faltan parámetros en la solicitud. Asegúrese de incluir db, collection y tag.' }));
                        return;
                    }
            
                    // Selección de la base de datos según lo que se pasa por el WebSocket
                    const dbSeleccionada = db2;
            
                    // Verificar si la colección existe
                    const coleccion = dbSeleccionada.collection(collection);
                    if (!coleccion) {
                        ws.send(JSON.stringify({ error: `Colección ${collection} no encontrada en la base de datos.` }));
                        return;
                    }
            
                    // Realizar la consulta en la base de datos y devolver los ciclos encontrados
                    const documentos = await coleccion.find({
                        "data.tag": tag,
                        "data.tipo": "Ciclo" // Filtramos por el tipo "Ciclo"
                    }).sort({ timestamp: 1 }).toArray();
            
                    // Filtrar los resultados
                    const resultado = documentos.map(doc => {
                        const dataFiltrada = doc.data.find(item => item.tag === tag && item.tipo === "Ciclo");
                        return dataFiltrada ? {
                            _id: doc._id,
                            timestamp: doc.timestamp,
                            tag: dataFiltrada.tag,
                            tipo: dataFiltrada.tipo,
                            inicio: dataFiltrada.inicio,
                            fin: dataFiltrada.fin,
                            duracion_segundos: dataFiltrada.duracion_segundos,
                            duracion_formato: dataFiltrada.duracion_formato
                        } : null;
                    }).filter(item => item !== null);
            
                    if (resultado.length > 0) {
                        ws.send(JSON.stringify({ message: 'Ciclos encontrados', data: resultado }));
                    } else {
                        ws.send(JSON.stringify({ message: `No se encontraron ciclos para el tag "${tag}".` }));
                    }
                } catch (error) {
                    console.error("Error al procesar la solicitud:", error);
                    ws.send(JSON.stringify({ error: `Error al procesar la solicitud: ${error.message}` }));
                }
            }
            
            

        } catch (error) {
            console.error('Error al procesar el mensaje:', error);
            ws.send(JSON.stringify({ error: 'Error al procesar la solicitud' }));
        }
    });
});

// Iniciar servidor WebSocket
async function iniciarConexiones() {
    await conectarDB();
    server.listen(4200, () => {
        console.log('Servidor WebSocket corriendo en http://91.134.75.7:4200');
    });
}

iniciarConexiones();
