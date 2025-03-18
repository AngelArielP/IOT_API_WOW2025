const mongoose = require('mongoose');
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });
const url = process.env.MONGO_URL;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch(err => console.error('Error de conexión a MongoDB', err));
