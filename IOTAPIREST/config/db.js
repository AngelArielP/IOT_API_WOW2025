const mongoose = require('mongoose');

mongoose.connect('mongodb://admin:adminpassword@91.134.75.7:27017', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch(err => console.error('Error de conexión a MongoDB', err));
