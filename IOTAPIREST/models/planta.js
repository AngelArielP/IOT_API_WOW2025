const mongoose = require('mongoose');

const plantaSchema = new mongoose.Schema({
    fechaAlta: { type: Date, default: Date.now },
    nombrePlanta: { type: String, required: true },
    areasDeLaPlanta: { type: [String], required: true },
    idPlanta: { type: String, required: true },
    EwonMqtt: { type: String, required: true },
    idEwon: { type: String, required: true },
    empresanombre: { type: String, required: true },

});

module.exports = mongoose.model('Planta', plantaSchema);
