const jwt = require('jsonwebtoken');
const sql = require('mssql'); // Necesitas sql para interactuar con la DB si el middleware va a buscar el usuario
const jwtSecret = process.env.JWT_SECRET || 'supersecretkey_for_bookstore_app_123'; // Usa la misma clave secreta que en server.js

const protect = async (req, res, next) => {
    let token;

    // Verificar si el token está en los headers de autorización
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener token del header
            token = req.headers.authorization.split(' ')[1];

            // Verificar token
            const decoded = jwt.verify(token, jwtSecret);

            // Obtener el pool de conexión a la DB de app.locals.db
            const pool = req.app.locals.db;
            if (!pool) {
                console.error('Error: Pool de conexión a la DB no disponible en el middleware.');
                return res.status(500).json({ message: 'Error interno del servidor (DB no conectada).' });
            }

            // Buscar el usuario por ID (del token) en la base de datos
            const request = pool.request();
            request.input('id', sql.Int, decoded.id); // Asume que el ID en tu JWT es un entero
            const result = await request.query('SELECT id, username, email FROM Users WHERE id = @id');

            req.user = result.recordset[0]; // Adjuntar el usuario al objeto de la solicitud
            if (!req.user) {
                return res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
            }

            next(); // Continuar con la siguiente función del middleware/ruta
        } catch (error) {
            console.error('Error de autenticación del token:', error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado, por favor inicia sesión de nuevo.' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Token inválido, no autorizado.' });
            }
            res.status(401).json({ message: 'No autorizado, token falló.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token.' });
    }
};

module.exports = { protect };