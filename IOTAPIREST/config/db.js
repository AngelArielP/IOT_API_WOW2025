const mongoose = require('mongoose');
require('dotenv').config();

const mongoUser = process.env.MONGO_INITDB_ROOT_USERNAME;
const mongoPass = process.env.MONGO_INITDB_ROOT_PASSWORD;
const mongoHost = process.env.IP_PROD; // Nombre del servicio en `docker-compose.yml`
const mongoPort = process.env.PORT_MONGO || 27017;

const mongoUrl = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}`;
console.log(`Conectando a MongoDB en: ${mongoUrl}`);

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch(err => console.error('Error de conexión a MongoDB', err));
