const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema({
    turno: { type: String, required: true },
    contadorCiclos: { type: Number, required: true },
    fechacicloinicial: { type: Date},
    fechaciclofinal: { type: Date}
});

const ciclosPlanta1Schema = new mongoose.Schema({
    maquina: { type: String, required: true },
    turnos: { type: [turnoSchema], required: true }, // Array de turnos
    fechaCreacion: { type: String, required: true },  
    cicloTotal: { type: Number, required: true }  
});

// Crear índices para optimizar las búsquedas
ciclosPlanta1Schema.index({ maquina: -1, fechaCreacion: -1 });  

module.exports = mongoose.model('CiclosPlanta1', ciclosPlanta1Schema);
