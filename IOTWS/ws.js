const { MongoClient } = require('mongodb');
const WebSocket = require('ws'); // WebSocket para comunicación en tiempo real
require('dotenv').config();

const mongoUser = process.env.MONGO_INITDB_ROOT_USERNAME;
const mongoPass = process.env.MONGO_INITDB_ROOT_PASSWORD;
const mongoHost = process.env.IP_PROD; // Nombre del servicio en `docker-compose.yml`
const mongoPort = process.env.PORT_MONGO || 27017;

const mongoUrl = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}`;
console.log(`Conectando a MongoDB en: ${mongoUrl}`);
const url = mongoUrl; // URL de MongoDB
const dbName = 'test'; // Base de datos única
const collectionName = 'realtimeplanta1'; // Colección con datos de todas las máquinas

// Crea la instancia de MongoDB
const client = new MongoClient(url, { useUnifiedTopology: true });
let db;

// Conectar a la base de datos
async function conectarDB() {
    try {
        await client.connect();
        console.log('Conectado correctamente a MongoDB');
        db = client.db(dbName);
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
    }
}

// Crear servidor WebSocket
const server = require('http').createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Nuevo cliente conectado al WebSocket');
    ws.send(JSON.stringify({ message: 'Conectado al servidor WebSocket' }));

    ws.on('message', async (message) => {
        try {
            const { type, maquina, tag, fecha } = JSON.parse(message);
            if (!maquina || !tag || !fecha) {
                ws.send(JSON.stringify({ error: 'Faltan parámetros: maquina, tag y fecha son obligatorios.' }));
                return;
            }

            const fechaInicio = new Date(fecha);
            if (isNaN(fechaInicio.getTime())) {
                ws.send(JSON.stringify({ error: 'Fecha inválida. Use formato yyyy-mm-dd.' }));
                return;
            }

            const coleccion = db.collection(collectionName);

            if (type === 'fetchDocuments') {
                const documentos = await coleccion.find({
                    maquina,
                    timestamp: { $gte: fechaInicio },
                    "data.tag": tag
                }).sort({ timestamp: 1 }).toArray();

                const resultado = documentos.map(doc => {
                    const dataFiltrada = doc.data.find(item => item.tag === tag);
                    return dataFiltrada ? { timestamp: doc.timestamp, tag: dataFiltrada.tag, value: dataFiltrada.value } : null;
                }).filter(item => item !== null);

                ws.send(JSON.stringify({ message: 'Documentos encontrados', data: resultado }));
            }
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            ws.send(JSON.stringify({ error: 'Error interno del servidor' }));
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
