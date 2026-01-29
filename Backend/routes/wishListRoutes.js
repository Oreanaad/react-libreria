// Backend/routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// Rutas para la Wishlist (ejemplos)
router.get('/', protect, wishlistController.getWishlist); // GET /api/wishlist
router.post('/add', protect, wishlistController.addItemToWishlist); // POST /api/wishlist/add
router.delete('/remove/:bookId', protect, wishlistController.removeItemFromWishlist); // DELETE /api/wishlist/remove/:bookId
router.put('/sync', protect, wishlistController.syncWishlist); // <-- AÑADE ESTA LÍNEA

module.exports = router;