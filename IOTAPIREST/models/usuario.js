const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    rol: { type: String, required: true },
    fechaCreacion: { type: Date, default: Date.now },
    fechaDesactivacion: { type: Date },
    contrasena: { type: String, required: true },
    idPlanta: { type:String, ref: 'Planta', required: true }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
