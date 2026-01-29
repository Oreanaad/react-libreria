// Backend/controllers/reviewController.js
const db = require('../models');
const Review = db.Review;
const User = db.User;
const Book = db.Book;

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, as: 'user', attributes: ['username'] },
                { model: Book, as: 'bookData', attributes: ['title'] }
            ]
        });
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener reseñas', error: error.message });
    }
};

exports.getReviewsByBookId = async (req, res) => {
    try {
        const bookId = parseInt(req.params.bookId, 10);
        if (isNaN(bookId)) {
            return res.status(400).json({ message: 'ID de libro inválido proporcionado.' });
        }

        const reviews = await Review.findAll({
            where: { bookId: bookId }, // <-- ¡REGRESAMOS AQUÍ! Usar 'bookId'
            include: [
                { model: User, as: 'user', attributes: ['username'] }
            ]
        });
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error al obtener reseñas por libro:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener reseñas por libro', error: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        // Asume que tu middleware de autenticación (como `protect`)
        // ya ha validado el token y adjuntado la información del usuario a `req.user`.
        // `req.user.id` contendrá el ID del usuario autenticado.
        const userId = req.user ? req.user.id : null; // Obtén el ID del usuario autenticado

        if (!userId) {
            // Si por alguna razón no se pudo obtener el ID del usuario (ej. token inválido/ausente)
            return res.status(401).json({ message: 'No autorizado: Debes iniciar sesión para crear una reseña.' });
        }

        const { bookId, rating, comment } = req.body; // Obtén los datos del cuerpo de la solicitud

        // Crea el objeto de datos para la reseña, incluyendo el userId
        // Asegúrate que los nombres de las propiedades aquí (bookId, userId)
        // coincidan con los nombres de las columnas en tu base de datos
        // (después de cualquier renombramiento a camelCase que hayas hecho en la DB).
        const reviewData = {
            bookId: bookId, // Si tu columna en DB es 'bookId' (camelCase)
            userId: userId, // Si tu columna en DB es 'userId' (camelCase)
            rating: rating,
            comment: comment
        };
        // Si NO renombraste en DB y sigues con snake_case (book_id, user_id):
        // const reviewData = {
        //     book_id: bookId,
        //     user_id: userId,
        //     rating: rating,
        //     comment: comment
        // };

        const newReview = await Review.create(reviewData); // Pasa el objeto con userId
        res.status(201).json(newReview);

    } catch (error) {
        console.error('Error al crear reseña:', error);
        // Es crucial que el log del backend nos diga el error exacto aquí.
        // `error.message` a menudo contiene la razón de la falla de la base de datos.
        res.status(500).json({ message: 'Error interno del servidor al crear reseña', error: error.message });
    }
};


exports.updateReview = async (req, res) => {
    try {
        const [updated] = await Review.update(req.body, {
            where: { id: req.params.id } // <-- ¡REGRESAMOS AQUÍ! Usar 'id'
        });
        if (updated) {
            const updatedReview = await Review.findByPk(req.params.id);
            return res.status(200).json({ message: 'Reseña actualizada exitosamente', review: updatedReview });
        }
        throw new Error('Reseña no encontrada o datos inválidos');
    } catch (error) {
        console.error('Error al actualizar reseña:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar reseña', error: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const deleted = await Review.destroy({
            where: { id: req.params.id } // <-- ¡REGRESAMOS AQUÍ! Usar 'id'
        });
        if (deleted) {
            return res.status(204).json({ message: 'Reseña eliminada exitosamente' });
        }
        throw new Error('Reseña no encontrada');
    } catch (error) {
        console.error('Error al eliminar reseña:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar reseña', error: error.message });
    }
};