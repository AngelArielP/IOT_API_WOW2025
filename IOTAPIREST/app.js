const express = require('express');
const cors = require('./middleware/cors');
const mongoose = require('mongoose');
require('dotenv').config();

const usuarioRoutes = require('./routes/usuarioRoutes');
const plantaRoutes = require('./routes/plantaRoutes');
const dispositivoRoutes = require('./routes/dispositivoRoutes');
const RealTimePlanta1Routes = require('./routes/realTimePlanta1Routes');
const ciclosPlanta1Routes = require('./routes/ciclosPlanta1Routes');
const contadoresCiclosPlanta1Routes = require('./routes/contadoresCiclosPlanta1Routes');

const mongoUser = process.env.MONGO_INITDB_ROOT_USERNAME;
const mongoPass = process.env.MONGO_INITDB_ROOT_PASSWORD;
const mongoHost = process.env.IP_PROD; // Nombre del servicio en `docker-compose.yml`
const mongoPort = process.env.PORT_MONGO || 27017;

const mongoUrl = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}`;
console.log(`Conectando a MongoDB en: ${mongoUrl}`);

const app = express();

// Middleware
app.use(express.json());
app.use(cors);

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/planta', plantaRoutes);
app.use('/api/dispositivos', dispositivoRoutes);
app.use('/api/realtimeplanta1', RealTimePlanta1Routes);
app.use('/api/ciclosplanta1', ciclosPlanta1Routes);
app.use('/api/contadoresciclosplanta1', contadoresCiclosPlanta1Routes);

// Conexión a la base de datos
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(4100, () => {
            console.log('Servidor en puerto 4100');
        });
    })
    .catch(err => console.error('Error al conectar a MongoDB', err));
