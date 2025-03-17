const mongoose = require('mongoose');

const dispositivoSchema = new mongoose.Schema({
    nombreDispositivo: { type: String, required: true },
    idPlanta: { type: mongoose.Schema.Types.ObjectId, ref: 'Planta', required: true },
    numeroTags: { type: Number, required: true }
});

module.exports = mongoose.model('Dispositivo', dispositivoSchema);
