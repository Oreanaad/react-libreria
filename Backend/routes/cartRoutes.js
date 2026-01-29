// Backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, cartController.getCart);
router.put('/sync', protect, cartController.syncCart);


module.exports = router;