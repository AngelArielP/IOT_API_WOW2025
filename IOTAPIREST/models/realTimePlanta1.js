const mongoose = require('mongoose');

const realTimePlanta1Schema = new mongoose.Schema({
    maquina: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    timestamp: { type: Date, default: Date.now },
    data: [{
        tag: { type: String },
        value: { type: Number }
    }]
});

// Declarar índices en el esquema
realTimePlanta1Schema.index({ maquina: 1 });  // Índice ascendente para 'maquina'
realTimePlanta1Schema.index({ fecha: 1 });    // Índice ascendente para 'fecha'

// Compilar el modelo
const RealTimePlanta1 = mongoose.model('RealTimePlanta1', realTimePlanta1Schema);

module.exports = RealTimePlanta1;