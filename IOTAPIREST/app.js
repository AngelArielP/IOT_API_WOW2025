require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

const cors = require('./middleware/cors');
const mongoose = require('mongoose');
const url = process.env.MONGO_URL;

const usuarioRoutes = require('./routes/usuarioRoutes');
const plantaRoutes = require('./routes/plantaRoutes');
const dispositivoRoutes = require('./routes/dispositivoRoutes');
const RealTimePlanta1Routes = require('./routes/realTimePlanta1Routes');
const ciclosPlanta1Routes = require('./routes/ciclosPlanta1Routes');
const contadoresCiclosPlanta1Routes = require('./routes/contadoresCiclosPlanta1Routes');

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
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(4100, () => {
            console.log('Servidor en puerto 4100');
        });
    })
    .catch(err => console.error('Error al conectar a MongoDB', err));
