const mongoose = require('mongoose');

const ciclosPlanta1Schema = new mongoose.Schema({
    maquina: { type: String, required: true },
    contadorCiclos: { type: Number, required: true },
    turno: { type: String, required: true },
    fechacicloinicial: { type: Date, required: true },
    fechaciclofinal: { type: Date, required: true },
    fechaCreacion: { type: Date, required: true },  // Fecha de creación del registro
    cicloTotal: { type: Number, required: true }  // Agregado el campo cicloTotal
});

// Crear índices para optimizar las búsquedas
ciclosPlanta1Schema.index({ maquina: -1, turno: -1, fechacicloinicial: -1, fechaciclofinal: -1 });  // Índice compuesto en maquina y fechas

module.exports = mongoose.model('CiclosPlanta1', ciclosPlanta1Schema);
