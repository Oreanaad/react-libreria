// Backend/controllers/authController.js
const db = require('../models');
const User = db.User; // Asegúrate de que User esté correctamente importado desde tus modelos
const bcrypt = require('bcryptjs'); // Para comparar contraseñas
const jwt = require('jsonwebtoken'); // Para generar JWTs
require('dotenv').config(); // Carga las variables de entorno

// Helper para generar el token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // El token expira en 1 hora
    });
};

// Función para registrar un nuevo usuario (implementación básica)
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Validar que los campos no estén vacíos
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Por favor, introduce todos los campos.' });
        }

        // 2. Verificar si el usuario ya existe
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe con este correo electrónico.' });
        }

        // 3. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Crear el usuario en la base de datos
        const newUser = await User.create({
            username,
            email,
            passwordHash: hashedPassword, // Asegúrate que tu modelo User tiene una columna 'passwordHash' o 'password'
            // Otros campos como 'createdAt', 'updatedAt' deberían ser manejados por Sequelize si tienes timestamps: true
        });

        // 5. Generar token y enviar respuesta (opcionalmente, podrías loguear al usuario automáticamente)
        const token = generateToken(newUser.id); // Asegúrate que tu User model tiene 'id'
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            },
            token, // Envía el token al frontend
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        // Si el login es exitoso, genera un token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email }, // Datos a incluir en el token
            process.env.JWT_SECRET, // Usa una variable de entorno segura
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        res.json({
            message: 'Inicio de sesión exitoso.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                // No envíes el passwordHash
            },
            token // Envía el token al frontend
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
};

const nodemailer = require('nodemailer');
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'No existe un usuario con ese correo electrónico.' });
        }

        const resetToken = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS 
            },
            tls: {
                rejectUnauthorized: false 
            }
        });

        // He ajustado la URL para que incluya el guion si tu ruta en React es /reset-password
        const resetUrl = `${process.env.FRONTEND_URL}/resettpassword/${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Recuperación de Contraseña - Tu App',
            html: `
                <h1 style="color: #333;">Restablecer Contraseña</h1>
                <p>Hola, <strong>${user.username}</strong>. Has solicitado restablecer tu contraseña.</p>
                <p>Haz clic en el botón de abajo para continuar:</p>
                <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Restablecer Contraseña
                </a>
                <p>Este enlace expirará en 15 minutos por tu seguridad.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        // RESPUESTA AJUSTADA: Incluimos la palabra "éxito" para que el frontend la pinte en VERDE
        res.json({ 
            success: true,
            message: 'El enlace de recuperación ha sido enviado con éxito a tu correo electrónico.' 
        });

    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({ message: 'Error al enviar el correo de recuperación.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.passwordHash = hashedPassword;
        await user.save();

        // RESPUESTA AJUSTADA: Mensaje claro para el éxito en el frontend
        res.json({ 
            success: true,
            message: 'Tu contraseña ha sido actualizada con éxito.' 
        });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'El enlace ha expirado. Por favor, solicita uno nuevo.' });
        }
        res.status(500).json({ message: 'Error interno al intentar restablecer la contraseña.' });
    }
};