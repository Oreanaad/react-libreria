// Backend/routes/bookRoutes.js

const express = require('express');
const router = express.Router();

// Importa el objeto que contiene las funciones del controlador
const bookController = require('../controllers/bookController');

// Importa tu middleware de autenticación.
// Asegúrate de que la ruta sea correcta según la ubicación de tu archivo authMiddleware.js
const { protect } = require('../middleware/authMiddleware'); // <--- Importación correcta del middleware 'protect'

// Ruta para obtener todos los libros
// Si deseas proteger esta ruta, puedes añadir 'protect' antes del controlador:
// router.get('/libros', protect, bookController.getAllBooks);
router.get('/libros', bookController.getAllBooks);

// Ruta para obtener un libro por ID
router.get('/libros/:id', bookController.getBookById);

// Ruta para crear un nuevo libro
// Esta ruta está protegida por el middleware 'protect'
router.post('/libros', protect, bookController.createBook); // <--- Usando el middleware 'protect'

// Otras rutas de libros (si las tienes, como actualizar o eliminar)
// router.put('/libros/:id', protect, bookController.updateBook);
// router.delete('/libros/:id', protect, bookController.deleteBook);

module.exports = router;
