// paginareact/Backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController'); // Asume que reviewController.js existe y está en la ubicación correcta
const { protect } = require('../middleware/authMiddleware');
// Ejemplo: Ruta para obtener todas las reseñas de un libro o todas
router.get('/reviews', reviewController.getAllReviews);
router.get('/reviews/:bookId', reviewController.getReviewsByBookId); 

// Ejemplo: Ruta para crear una nueva reseña
router.post('/reviews', protect, reviewController.createReview);

// Ejemplo: Ruta para actualizar una reseña
router.put('/reviews/:id', reviewController.updateReview);

// Ejemplo: Ruta para eliminar una reseña
router.delete('/reviews/:id', reviewController.deleteReview);

module.exports = router;