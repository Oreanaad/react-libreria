// Backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../models'); // Asegúrate de que esta ruta es correcta
const User = db.User; // Accediendo al modelo User a través de db

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener token del header
            token = req.headers.authorization.split(' ')[1];

            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Buscar usuario por ID (excluyendo el hash de la contraseña)
            req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['passwordHash'] } });

            if (!req.user) {
                return res.status(401).json({ message: 'Usuario no encontrado.' });
            }

            next(); // Continuar a la siguiente función del middleware/ruta

        } catch (error) {
            console.error('Error en el middleware de autenticación:', error); // Log útil
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Token inválido, no autorizado.' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado, por favor inicie sesión de nuevo.' });
            }
            // Si el error es "Pool de conexión no disponible", el problema es más arriba
            return res.status(500).json({ message: 'Error de autenticación.', error: error.message });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No hay token, no autorizado.' });
    }
};

module.exports = { protect };