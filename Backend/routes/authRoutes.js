// paginareact/Backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Asegúrate de tener este controlador

// Agrupa las rutas bajo '/auth' dentro del router
router.post('/register', authController.register); // O authController.registerUser si así la llamas
router.post('/login', authController.loginUser);     // Cambiado a /auth/login
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
// Si tienes alguna ruta protegida que requiera autenticación, puedes usar un middleware
// const authMiddleware = require('../middleware/authMiddleware');
// router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;