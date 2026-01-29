// Backend/controllers/cartController.js
const db = require('../models');
const { User, Book } = db;

// Controlador para sincronizar el carrito del usuario
exports.syncCart = async (req, res) => {
    // req.user viene del middleware 'protect' si el token es válido
    const userId = req.user.id;
    const { cartItems } = req.body; // Se espera que el frontend envíe un array de ítems

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Asume que la columna 'Cart' en tu tabla Users es de tipo TEXT o NVARCHAR(MAX)
        // y que guardas el carrito como una cadena JSON.
        user.Cart = JSON.stringify(cartItems); // Guarda el array de objetos como string JSON
        await user.save();

        res.status(200).json({ message: 'Carrito sincronizado exitosamente.', cart: cartItems });

    } catch (error) {
        console.error('Error en syncCart:', error);
        res.status(500).json({ message: 'Error interno del servidor al sincronizar el carrito.', error: error.message });
    }
};

// Puedes añadir una función para obtener el carrito del usuario si lo necesitas
exports.getCart = async (req, res) => {
    try {
        // req.user viene del middleware 'protect'
        const userId = req.user.id;
        console.log(`[Backend] Obteniendo carrito para userId: ${userId}`);

        // Busca al usuario y su carrito usando Sequelize
        const user = await User.findByPk(userId);

        if (!user) {
            console.log(`[Backend] Usuario ${userId} no encontrado.`);
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        let cartItemsStored = [];
        if (user.Cart) { // El campo `Cart` debe existir en tu modelo User
            try {
                cartItemsStored = JSON.parse(user.Cart);
            } catch (jsonError) {
                console.error(`[Backend] Error al parsear JSON del carrito para usuario ${userId}:`, jsonError);
                cartItemsStored = []; // Inicia con un carrito vacío si el JSON es inválido
            }
        }
        
        if (cartItemsStored.length === 0) {
            return res.status(200).json({ cart: [] }); // Devuelve un carrito vacío si no hay items
        }

        // Obtiene los IDs de los libros del carrito
        const bookIds = cartItemsStored.map(item => item.bookId);

        // Busca los detalles de los libros usando un solo query con `findAll`
        const books = await Book.findAll({
            where: {
                id: {
                    [Op.in]: bookIds // Usa el operador 'in' para buscar múltiples IDs
                }
            },
            attributes: ['id', 'title', 'price', 'image_url'] // Selecciona solo los atributos que necesitas
        });

        // Mapea los libros a un objeto para un acceso más rápido
        const booksMap = books.reduce((map, book) => {
            map[book.id] = book;
            return map;
        }, {});

        // Combina los datos del carrito con los detalles de los libros
        const detailedCartItems = cartItemsStored
            .filter(item => booksMap[item.bookId]) // Filtra los items de libros que ya no existen
            .map(item => ({
                ...booksMap[item.bookId].dataValues,
                quantity: item.quantity
            }));
            
        console.log(`[Backend] Carrito cargado y detallado para ${userId}:`, detailedCartItems);
        res.status(200).json({ cart: detailedCartItems });
    } catch (error) {
        console.error('[Backend] Error en getCart:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el carrito.', error: error.message });
    }
};