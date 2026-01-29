// Backend/controllers/wishlistController.js
const db = require('../models');
const User = db.User;

exports.getWishlist = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const wishlist = user.Wishlist ? JSON.parse(user.Wishlist) : [];
        res.status(200).json({ wishlist });
    } catch (error) {
        console.error('Error en getWishlist:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener la wishlist.', error: error.message });
    }
};

exports.addItemToWishlist = async (req, res) => {
    const userId = req.user.id;
    const { bookId } = req.body; // Espera el ID del libro

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        let wishlist = user.Wishlist ? JSON.parse(user.Wishlist) : [];

        // Añadir el libro si no está ya
        if (!wishlist.includes(bookId)) {
            wishlist.push(bookId);
            user.Wishlist = JSON.stringify(wishlist);
            await user.save();
        }

        res.status(200).json({ message: 'Libro añadido a la wishlist.', wishlist });
    } catch (error) {
        console.error('Error en addItemToWishlist:', error);
        res.status(500).json({ message: 'Error interno del servidor al añadir a la wishlist.', error: error.message });
    }
};

exports.removeItemFromWishlist = async (req, res) => {
    const userId = req.user.id;
    const { bookId } = req.params; // El ID del libro viene de la URL

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        let wishlist = user.Wishlist ? JSON.parse(user.Wishlist) : [];

        // Eliminar el libro
        const initialLength = wishlist.length;
        wishlist = wishlist.filter(id => id !== parseInt(bookId)); // Asegúrate de que los tipos coincidan (number vs string)

        if (wishlist.length < initialLength) {
            user.Wishlist = JSON.stringify(wishlist);
            await user.save();
            res.status(200).json({ message: 'Libro eliminado de la wishlist.', wishlist });
        } else {
            res.status(404).json({ message: 'Libro no encontrado en la wishlist.' });
        }

    } catch (error) {
        console.error('Error en removeItemFromWishlist:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar de la wishlist.', error: error.message });
    }
};
exports.syncWishlist = async (req, res) => {
    const userId = req.user.id;
    const { wishlistItems } = req.body;

    try {
        const user = await db.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        user.Wishlist = JSON.stringify(wishlistItems); // Guarda como JSON string
        await user.save();
        res.status(200).json({ message: 'Wishlist sincronizada exitosamente.', wishlist: wishlistItems });
    } catch (error) {
        console.error('Error al sincronizar la wishlist:', error);
        res.status(500).json({ message: 'Error interno del servidor al sincronizar la wishlist.' });
    }
};