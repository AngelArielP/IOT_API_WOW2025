const cors = require('cors');

module.exports = cors({
    origin: '*', // Puedes especificar un dominio específico aquí si es necesario
    methods: ['GET', 'POST', 'PUT', 'DELETE']
});
