// Backend/controllers/orderController.js

const db = require('../models');
const { Order, sequelize , OrderItem, Book,} = db;



const createOrder = async (req, res) => {
  // Usamos una transacción para que si falla la orden, no se quede el cliente creado "huérfano"
  const t = await sequelize.transaction();

  try {
    console.log("[DEBUG] Body recibido en createOrder:", req.body);

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      state,
      country,
      apartment,
      gender,
      birthDate,
      totalPrice,
      userId,
      status,
      products,
    } = req.body;

    // 1. ✅ Crear primero el registro en OrdersCustomersInfo
    // Esto genera el ID que la tabla Orders necesita para la clave foránea
    const customer = await OrdersCustomersInfo.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      state,
      country,
      apartment,
      gender,
      birthDate: birthDate ? birthDate.split("T")[0] : null,
      userId: userId || null
    }, { transaction: t });

    // 2. ✅ Crear la orden usando el ID del cliente recién creado (customer.id)
    const order = await Order.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      state,
      country,
      apartment,
      gender,
      birthDate: birthDate ? birthDate.split("T")[0] : null,
      totalPrice,
      userId,
      customerId: customer.id, // <--- Aquí usamos el ID real que acaba de nacer
      status: status || 'Pendiente',
    }, { transaction: t });

    // 3. ✅ Asociar productos
    if (products && products.length > 0) {
      for (const p of products) {
        await OrderItem.create({
          orderId: order.id,
          productId: p.productId,
          title: p.title,
          quantity: p.quantity,
          price: p.price,
        }, { transaction: t });
      }
    }

    // Si todo salió bien, confirmamos los cambios en la DB
    await t.commit();
    res.json({ success: true, orderId: order.id });

  } catch (err) {
    // Si hubo un error, deshacemos cualquier cambio (transacción)
    await t.rollback();
    console.error("❌ Error creando la orden:", err);
    res.status(500).json({ success: false, message: "Error al crear la orden", error: err.message });
  }
};

// ... resto de tus funciones (getOrdersByUser) permanecen igual


const getOrdersByUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);

        const orders = await Order.findAll({
            where: {
                userId: userId
            },
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                     attributes: ['OrderItemId', 'OrderId', 'ProductId', 'Title', 'Quantity', 'Price'],
                     required: true,
                    include: [
                        {
                            model: Book,
                            as: 'product',
                             required: true,
                             attributes: [ 'title', 'imageUrl', 'authorId']
                        }
                    ]
                   
              
                }
            ]
        });

        if (!orders || orders.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.status(500).json({ message: 'Error del servidor al obtener los pedidos.', error: error.message });
    }
};

module.exports = {
    getOrdersByUser,
    createOrder
};