// Backend/controllers/authorController.js
const { Author } = require('../models'); // Asegúrate de importar tu modelo Author correctamente

const authorController = {
    getAllAuthors: async (req, res) => {
        try {
            const authors = await Author.findAll(); // Usa Sequelize para encontrar todos los autores
            res.json(authors); // Envía los autores como respuesta JSON
        } catch (error) {
            console.error('Error fetching authors:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener autores.' });
        }
    }
    // Puedes añadir más funciones aquí si necesitas, por ejemplo, getAuthorById
};

module.exports = authorController;