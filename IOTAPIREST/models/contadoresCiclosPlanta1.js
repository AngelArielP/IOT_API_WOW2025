const mongoose = require('mongoose');

const contadoresCiclosPlanta1Schema = new mongoose.Schema({
    maquina: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    contadorCiclos: { type: Number },
    turno: { type: String }
});

module.exports = mongoose.model('ContadoresCiclosPlanta1', contadoresCiclosPlanta1Schema);
