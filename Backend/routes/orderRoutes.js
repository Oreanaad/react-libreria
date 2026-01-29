// Backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {orderController, getOrdersByUser }= require('../controllers/orderController'); 
const models = require('../models'); // Asegúrate de que este path sea correcto
const { createOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware'); // O el middleware que uses

// Ruta para obtener todos los pedidos de un usuario específico
// GET /api/orders/user/:userId
router.post('/',createOrder);
router.get('/user/:userId', protect, getOrdersByUser);
router.get('/:orderId/items', async (req, res) => {
    try {
        let orderId = req.params.orderId;

        // CAMBIO CRÍTICO: Convierte el orderId a un número
        orderId = parseInt(orderId, 10);
        
        // Verifica si la conversión fue exitosa
        if (isNaN(orderId)) {
            return res.status(400).json({ error: 'Invalid Order ID' });
        }

        const orderItems = await models.OrderItem.findAll({
            where: {
                orderId: orderId
            },
            include: [
                {
                    model: models.Book,
                    as: 'product',
                    attributes: ['id', 'title', 'imageUrl', 'authorId']
                }
            ]
        });

        if (!orderItems || orderItems.length === 0) {
            return res.status(404).json({ error: 'No items found for this order' });
        }

        res.status(200).json(orderItems);
    } catch (error) {
        console.error('Error fetching order items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;