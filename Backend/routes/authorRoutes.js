// Backend/routes/authorRoutes.js (o añade esto a bookRoutes.js si quieres consolidar)
const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController'); // Asumiendo que el controlador de autores estará aquí

// Ruta para obtener todos los autores
router.get('/authors', authorController.getAllAuthors);

module.exports = router;