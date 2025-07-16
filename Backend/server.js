// server.js

// Cargar variables de entorno desde .env al inicio
require('dotenv').config();

const express = require('express');
const sql = require('mssql'); // Librería para SQL Server
const cors = require('cors'); // Para manejar políticas CORS
const nodemailer = require('nodemailer'); // Importa Nodemailer
const bcrypt = require('bcryptjs'); // Importa bcryptjs para hashing de contraseñas
const jwt = require('jsonwebtoken'); // Importa jsonwebtoken para tokens de autenticación
const crypto = require('crypto'); // Para generar tokens seguros

const app = express();
const port = process.env.PORT || 3001; // Puerto en el que correrá tu API Node.js
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')));
// --- Importar el middleware de autenticación ---
const { protect } = require('./middleware/authMiddleware'); // Asegúrate de que la ruta sea correcta

// --- Configuración de la conexión a SQL Server ---
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
    }
};

let dbPool; // Variable para almacenar el pool de conexión a la DB

sql.connect(dbConfig)
    .then(pool => {
        if (pool.connected) {
            console.log('¡Conectado exitosamente al pool de SQL Server!');
        }
        dbPool = pool; // Asigna el pool a la variable global
        app.locals.db = pool; // También lo hace accesible vía app.locals (opcional pero útil)
    })
    .catch(err => {
        console.error('Error FATAL al conectar al pool de SQL Server:', err);
        process.exit(1); // Sale de la aplicación si no puede conectar a la DB
    });

// --- Configuración del transporter de Nodemailer (para enviar correos) ---
const mailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465', // true para puerto 465 (SSL), false para otros (TLS/STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verifica la conexión del transporter (opcional, pero útil para depurar)
mailTransporter.verify((error, success) => {
    if (error) {
        console.error('Error al verificar el transporter de correo:', error);
    } else {
        console.log('Servidor de correo listo para enviar mensajes.');
    }
});

// --- Clave secreta para JWT ---
const jwtSecret = process.env.JWT_SECRET || 'supersecretkey_for_bookstore_app_123';
if (!process.env.JWT_SECRET) {
    console.warn('ADVERTENCIA: JWT_SECRET no está definido en .env. Usando una clave por defecto (no segura para producción).');
}

// --- URL del frontend para redirecciones y enlaces de correo ---
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
if (!process.env.FRONTEND_URL) {
    console.warn('ADVERTENCIA: FRONTEND_URL no está definido en .env. Usando http://localhost:5173 por defecto.');
}


// Middlewares de Express
app.use(cors()); // Habilita CORS para permitir solicitudes desde tu frontend React
app.use(express.json()); // Permite a la API recibir datos en formato JSON

// --- Funciones de Utilidad para Envío de Correos ---
async function sendVerificationEmail(email, token) {
    const verificationLink = `${frontendUrl}/confirmarEmail?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Confirma tu cuenta en Booksflea',
        html: `
            <p>Hola,</p>
            <p>Gracias por registrarte en Booksflea. Por favor, haz clic en el siguiente enlace para confirmar tu dirección de correo electrónico:</p>
            <p><a href="${verificationLink}">Confirmar mi cuenta</a></p>
            <p>Este enlace expirará en 24 horas.</p>
            <p>Si no te registraste en Booksflea, por favor ignora este correo.</p>
            <p>Saludos,</p>
            <p>El equipo de Booksflea</p>
        `,
    };
    try {
        await mailTransporter.sendMail(mailOptions);
        console.log(`Correo de verificación enviado a ${email}`);
    } catch (error) {
        console.error(`Error al enviar correo de verificación a ${email}:`, error);
    }
}

async function sendPasswordResetEmail(email, token) {
    const resetLink = `${frontendUrl}/resetPassword?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Restablecer tu contraseña de Booksflea',
        html: `
            <p>Hola,</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de Booksflea.</p>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <p><a href="${resetLink}">Restablecer mi contraseña</a></p>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo.</p>
            <p>Saludos,</p>
            <p>El equipo de Booksflea</p>
        `,
    };
    try {
        await mailTransporter.sendMail(mailOptions);
        console.log(`Correo de restablecimiento de contraseña enviado a ${email}`);
    } catch (error) {
        console.error(`Error al enviar correo de restablecimiento a ${email}:`, error);
    }
}
// Funciones para Reseñas (¡Estas son las que debes mover aquí!)
const createReview = async (req, res) => {
    try {
        const pool = app.locals.db; // Obtener el pool de conexión de app.locals
        if (!pool) {
            return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
        }

        const userId = req.user.id;
        const { bookId, rating, comment } = req.body;

        if (!bookId || !rating || !comment) { return res.status(400).json({ message: 'Todos los campos (bookId, rating, comment) son obligatorios.' }); }
        if (rating < 1 || rating > 5) { return res.status(400).json({ message: 'La valoración debe ser entre 1 y 5 estrellas.' }); }

        const checkBookRequest = pool.request();
        checkBookRequest.input('bookId', sql.Int, bookId);
        const bookResult = await checkBookRequest.query('SELECT id FROM Libros WHERE id = @bookId'); // O 'libros' si es el nombre de tu tabla
        if (bookResult.recordset.length === 0) { return res.status(404).json({ message: 'El libro especificado no existe.' }); }

        const insertReviewRequest = pool.request();
        insertReviewRequest.input('bookId', sql.Int, bookId);
        insertReviewRequest.input('userId', sql.Int, userId);
        insertReviewRequest.input('rating', sql.Int, rating);
        insertReviewRequest.input('comment', sql.NVarChar(sql.MAX), comment);

        const insertResult = await insertReviewRequest.query(`
            INSERT INTO Reviews (book_id, user_id, rating, comment, created_at)
            VALUES (@bookId, @userId, @rating, @comment, GETDATE());
            SELECT SCOPE_IDENTITY() AS review_id;
        `);

        const newReviewId = insertResult.recordset[0].review_id;

        const getNewReviewRequest = pool.request();
        getNewReviewRequest.input('reviewId', sql.Int, newReviewId);
        const newReviewRows = await getNewReviewRequest.query(`
            SELECT r.review_id, r.book_id, r.user_id, r.rating, r.comment, r.created_at, u.username
            FROM Reviews r
            JOIN Users u ON r.user_id = u.id
            WHERE r.review_id = @reviewId
        `);

        res.status(201).json({ message: 'Reseña creada con éxito', review: newReviewRows.recordset[0] });

    } catch (error) {
        console.error('Error al crear la reseña:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear la reseña.' });
    }
};

const getReviewsByBookId = async (req, res) => {
    try {
        const pool = app.locals.db;
        if (!pool) { return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' }); }

        const { bookId } = req.params;
        if (isNaN(bookId) || parseInt(bookId) <= 0) { return res.status(400).json({ message: 'El ID del libro no es válido.' }); }

        const request = pool.request();
        request.input('bookId', sql.Int, bookId);

        const reviewsResult = await request.query(`
            SELECT
                r.review_id, r.rating, r.comment, r.created_at, u.id AS user_id, u.username
            FROM Reviews r
            JOIN Users u ON r.user_id = u.id
            WHERE r.book_id = @bookId
            ORDER BY r.created_at DESC
        `);

        if (reviewsResult.recordset.length === 0) { return res.status(200).json([]); }
        res.status(200).json(reviewsResult.recordset);

    } catch (error) {
        console.error('Error al obtener las reseñas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener las reseñas.' });
    }
};


app.get('/api/libros', async (req, res) => {
    try {
        const pool = app.locals.db;
        if (!pool) {
            return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const { category, search } = req.query;

        let whereClauses = [];
        let request = pool.request();

        if (category && category.trim() !== '') {
            whereClauses.push(`LOWER(L.category) = LOWER(@category)`); // Add 'L.' for clarity
            request.input('category', sql.NVarChar, category.trim());
        }

        if (search && search.trim() !== '') {
            // *** CAMBIO CLAVE AQUÍ: AHORA BUSCAMOS TAMBIÉN EN EL NOMBRE DEL AUTOR DESDE LA TABLA 'authors' ***
            whereClauses.push(`(
                L.title COLLATE Latin1_General_CI_AI LIKE @search OR
                A.name COLLATE Latin1_General_CI_AI LIKE @search OR  -- <--- CAMBIO: Usar A.name (nombre del autor)
                L.category COLLATE Latin1_General_CI_AI LIKE @search OR
                L.description COLLATE Latin1_General_CI_AI LIKE @search
            )`);
            request.input('search', sql.NVarChar, `%${search.trim()}%`);
        }

        const whereString = whereClauses.length > 0 ? ` WHERE ` + whereClauses.join(' AND ') : '';

        // *** CAMBIO CLAVE AQUÍ: REALIZAMOS UN JOIN CON LA TABLA 'authors' Y SELECCIONAMOS 'A.name' COMO 'author' ***
        const booksQuery = `
            SELECT
                L.id,
                L.title,
                A.name AS author, 
                L.description,
                L.price,
                L.oldPrice,
                L.imageUrl,
                L.detailsLink,
                L.rating,
                L.discountPercentage,
                L.category,
                L.year,
                L.type
            FROM
                libros L -- Alias para la tabla libros
            JOIN
                authors A ON L.author_id = A.id -- <--- CAMBIO: Unimos con la tabla authors usando author_id
            ${whereString}
            ORDER BY L.id ASC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY;
        `;
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        const booksResult = await request.query(booksQuery);

        // Para el conteo total, también necesitamos el JOIN si los filtros aplican al autor
        // Si no hay filtros que dependan del autor, un simple COUNT en 'libros' podría bastar,
        // pero para consistencia y si el filtro de búsqueda incluye el autor, es mejor con JOIN.
        const totalCountQuery = `
            SELECT COUNT(*) AS total
            FROM libros L
            JOIN authors A ON L.author_id = A.id
            ${whereString}
        `;
        const totalCountResult = await request.query(totalCountQuery);

        const totalBooks = totalCountResult.recordset[0].total;
        const totalPages = Math.ceil(totalBooks / limit);

        res.json({
            books: booksResult.recordset,
            currentPage: page,
            totalPages: totalPages,
            totalBooks: totalBooks
        });

    } catch (err) {
        console.error('Error al obtener libros paginados y filtrados desde la DB:', err);
        res.status(500).json({ error: 'Error interno del servidor al obtener libros' });
    }
});

// Ruta para obtener un libro por ID
app.get('/api/libros/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = app.locals.db;
        if (!pool) {
            return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
        }
        const request = pool.request();
        request.input('LibroId', sql.Int, id); 

        const result = await request.query(`
            SELECT
                L.id,
                L.title,
                A.name AS author,
                A.description AS authorDescription,
                A.image_url AS authorImage, 
                A.category AS authorCategory, 
                L.description,
                L.price,
                L.oldPrice, 
                L.imageUrl,
                L.detailsLink,
                L.rating,
                L.discountPercentage,
                L.category,
                L.year,
                L.quantity,
                L.type
            FROM
                libros L
            JOIN
                authors A ON L.author_id = A.id
            WHERE L.id = @LibroId;
        `);

        if (result.recordset.length > 0) {
            const bookData = result.recordset[0];
            // *** AÑADE ESTE CONSOLE.LOG AQUÍ EN EL BACKEND ***
            console.log("Backend sending book data:", bookData);
            console.log("Backend sending oldPrice:", bookData.oldPrice);

            res.json(bookData);
        } else {
            res.status(404).json({ error: 'Libro no encontrado' });
        }
    } catch (err) {
        console.error(`Error al obtener libro ${id}:`, err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//Ruta para obtener autores

app.get('/api/authors', async (req, res) => {
    try {
        const pool = app.locals.db;
        if (!pool) {
            return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
        }

        const request = pool.request();

        const authorsQuery = `
            SELECT
                id,             
                name,           
                description,    
                image_url,      
                category,
                best_book_title,
                famous_quote

            FROM
                authors
            ORDER BY
                name ASC; -- Or whatever order you prefer, e.g., id, or a specific column
        `;

        const result = await request.query(authorsQuery);

        // Send the array of authors directly
        res.json(result.recordset);

    } catch (err) {
        console.error('Error al obtener autores desde la DB:', err); // Specific error message
        res.status(500).json({ error: 'Error interno del servidor al obtener autores' });
    }
});


// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido.' });
    }

    try {
        const pool = app.locals.db;
        if (!pool) {
            return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
        }

        const checkUser = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .query('SELECT id FROM Users WHERE username = @username OR email = @email');

        if (checkUser.recordset.length > 0) {
            return res.status(409).json({ message: 'El nombre de usuario o el email ya están registrados.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const emailConfirmToken = crypto.randomBytes(32).toString('hex');
        const emailConfirmExpires = new Date(Date.now() + 24 * 3600 * 1000);

        const request = pool.request();
        request.input('username', sql.NVarChar, username);
        request.input('email', sql.NVarChar, email);
        request.input('passwordHash', sql.NVarChar, passwordHash);
        request.input('emailConfirmToken', sql.NVarChar, emailConfirmToken);
        request.input('emailConfirmExpires', sql.DateTime, emailConfirmExpires);
        // Agrega Wishlist como un array JSON vacío por defecto al registrar
        request.input('wishlist', sql.NVarChar(sql.MAX), JSON.stringify([])); // <-- IMPORTANTE: Añade esto
        const result = await request.query('INSERT INTO Users (username, email, passwordHash, emailConfirmToken, emailConfirmExpires, Wishlist) VALUES (@username, @email, @passwordHash, @emailConfirmToken, @emailConfirmExpires, @wishlist); SELECT SCOPE_IDENTITY() AS id;');

        const userId = result.recordset[0].id;

        await sendVerificationEmail(email, emailConfirmToken);

        res.status(201).json({ message: 'Usuario registrado con éxito. Por favor, revisa tu email para confirmar tu cuenta.' });

    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ error: 'Error interno del servidor al registrar usuario.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
    }

    try {
        const pool = app.locals.db;
        if (!pool) {
            return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
        }

        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id, username, email, passwordHash, isConfirmed, Wishlist FROM Users WHERE email = @email'); // <-- AÑADE Wishlist AQUÍ

        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        if (!user.isConfirmed) {
            return res.status(403).json({ message: 'Por favor, confirma tu email antes de iniciar sesión.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' });

        let userWishlist = [];
        if (user.Wishlist) {
            try {
                userWishlist = JSON.parse(user.Wishlist);
            } catch (jsonError) {
                console.error("Error al parsear el JSON de la wishlist de la DB para el usuario", user.id, ":", jsonError);
                userWishlist = []; // Volver a wishlist vacía si hay error de parseo
            }
        }

        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isConfirmed: user.isConfirmed,
                wishlist: userWishlist // <--- AÑADE LA WISHLIST PARSEADA AQUÍ
            }
        });

    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'El email es obligatorio.' });
    }

    try {
        const pool = app.locals.db;
        if (!pool) {
            return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
        }

        const userResult = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id, email FROM Users WHERE email = @email');

        const user = userResult.recordset[0];

        if (!user) {
            return res.status(200).json({ message: 'Si tu email está registrado, recibirás un enlace para restablecer tu contraseña.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000);

        const request = pool.request();
        request.input('userId', sql.Int, user.id);
        request.input('token', sql.NVarChar, resetToken);
        request.input('expiresAt', sql.DateTime, expiresAt);
        await request.query('INSERT INTO PasswordResetTokens (userId, token, expiresAt) VALUES (@userId, @token, @expiresAt)');

        await sendPasswordResetEmail(user.email, resetToken);

        res.status(200).json({ message: 'Si tu email está registrado, recibirás un enlace para restablecer tu contraseña.' });

    } catch (err) {
        console.error('Error al solicitar restablecimiento de contraseña:', err);
        res.status(500).json({ error: 'Error interno del servidor al solicitar restablecimiento de contraseña.' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token y nueva contraseña son obligatorios.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const pool = app.locals.db;
        if (!pool) {
            return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
        }

        const tokenResult = await pool.request()
            .input('token', sql.NVarChar, token)
            .query('SELECT userId, expiresAt FROM PasswordResetTokens WHERE token = @token');

        const resetTokenEntry = tokenResult.recordset[0];

        if (!resetTokenEntry || new Date() > new Date(resetTokenEntry.expiresAt)) {
            return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        const updateRequest = pool.request();
        updateRequest.input('userId', sql.Int, resetTokenEntry.userId);
        updateRequest.input('passwordHash', sql.NVarChar, newPasswordHash);
        await updateRequest.query('UPDATE Users SET passwordHash = @passwordHash WHERE id = @userId');

        const deleteRequest = pool.request();
        deleteRequest.input('token', sql.NVarChar, token);
        await deleteRequest.query('DELETE FROM PasswordResetTokens WHERE token = @token');

        res.status(200).json({ message: 'Contraseña restablecida con éxito.' });

    } catch (err) {
        console.error('Error al restablecer contraseña:', err);
        res.status(500).json({ error: 'Error interno del servidor al restablecer contraseña.' });
    }
});


// --- RUTA PARA MANEJAR EL ENVÍO DEL FORMULARIO DE CONTACTO ---
app.post('/api/contact', async (req, res) => {
    try {
        const pool = app.locals.db;
        if (!pool) {
            return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
        }

        const { name, email, subject, service, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Nombre, Email y Mensaje son campos obligatorios.' });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ error: 'Formato de email inválido.' });
        }

        const request = pool.request();
        request.input('name', sql.NVarChar(255), name);
        request.input('email', sql.NVarChar(255), email);
        request.input('subject', sql.NVarChar(500), subject || null);
        request.input('service', sql.NVarChar(255), service || null);
        request.input('message', sql.NVarChar(sql.MAX), message);

        const insertQuery = `
            INSERT INTO ContactMessages (name, email, subject, service, message)
            VALUES (@name, @email, @subject, @service, @message);
        `;
        await request.query(insertQuery);
        console.log('Mensaje de contacto guardado en la base de datos:', { name, email });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.TO_EMAIL,
            subject: `Nuevo Mensaje de Contacto: ${subject || 'Sin Asunto'}`,
            html: `
                <p>Has recibido un nuevo mensaje a través del formulario de contacto:</p>
                <ul>
                    <li><strong>Nombre:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><li><strong>Asunto:</strong> ${subject || 'N/A'}</li></li>
                    
                </ul>
                <p><strong>Mensaje:</strong></p>
                <p>${message}</p>
                <hr>
                <small>Este correo fue enviado automáticamente desde tu aplicación.</small>
            `,
            replyTo: email
        };

        await mailTransporter.sendMail(mailOptions);
        console.log('Correo de notificación enviado a:', process.env.TO_EMAIL);

        res.status(201).json({ message: 'Mensaje recibido con éxito. ¡Gracias por contactarnos!' });

    } catch (err) {
        console.error('Error en el proceso del formulario de contacto:', err);
        res.status(500).json({ error: 'Error interno del servidor al procesar su mensaje.' });
    }
});


// --- NUEVAS RUTAS PARA LA WISHLIST ---
// GET /api/wishlist - Obtener la wishlist del usuario autenticado
app.get('/api/wishlist', protect, async (req, res) => {
    try {
        const pool = app.locals.db;
        if (!pool) {
            return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
        }

        // req.user.id viene del middleware `protect`
        const userId = req.user.id;

        const request = pool.request();
        request.input('userId', sql.Int, userId);
        const result = await request.query('SELECT Wishlist FROM Users WHERE id = @userId');

        const user = result.recordset[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // La wishlist se guarda como una cadena JSON en la DB, hay que parsearla
        const wishlist = user.Wishlist ? JSON.parse(user.Wishlist) : [];
        res.json(wishlist);

    } catch (err) {
      //  console.error('Error al obtener la wishlist del usuario:', err);
        res.status(500).json({ error: 'Error interno del servidor al obtener la wishlist.' });
    }
});app.put('/api/wishlist/sync', protect, async (req, res) => {
    let transaction; // Declarar la transacción fuera del try para que sea accesible en el catch y finally
    try {
        const pool = app.locals.db;
        if (!pool) {
        //    console.error('[Wishlist Sync] ERROR: La conexión a la base de datos (pool) no está establecida.');
            return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
        }

        const userId = req.user.id;
        const newWishlist = req.body; // Esto debería ser el array de objetos de libros

      //  console.log(`[Wishlist Sync - ${userId}] Recibida solicitud para sincronizar wishlist.`);
       // console.log(`[Wishlist Sync - ${userId}] Contenido de req.body:`, JSON.stringify(newWishlist, null, 2).substring(0, 500) + (JSON.stringify(newWishlist, null, 2).length > 500 ? '...' : ''));

        if (!Array.isArray(newWishlist)) {
          //  console.error(`[Wishlist Sync - ${userId}] Error: newWishlist no es un array.`);
            return res.status(400).json({ message: 'El cuerpo de la solicitud debe ser un array de ítems de wishlist.' });
        }

        const wishlistJson = JSON.stringify(newWishlist);
      //  console.log(`[Wishlist Sync - ${userId}] JSON a guardar en DB:`, wishlistJson.substring(0, 500) + (wishlistJson.length > 500 ? '...' : ''));

        // Iniciar una transacción explícita
        transaction = new sql.Transaction(pool);
        await transaction.begin();
      //  console.log(`[Wishlist Sync - ${userId}] Transacción iniciada.`);

        const request = new sql.Request(transaction); // Usar la transacción para la request
        request.input('userId', sql.Int, userId);
        request.input('wishlistJson', sql.NVarChar(sql.MAX), wishlistJson);

        const updateResult = await request.query('UPDATE Users SET Wishlist = @wishlistJson WHERE id = @userId');
      //  console.log(`[Wishlist Sync - ${userId}] Resultado de la consulta UPDATE:`, updateResult);
      //  console.log(`[Wishlist Sync - ${userId}] Filas afectadas:`, updateResult.rowsAffected);

        if (updateResult.rowsAffected[0] === 0) {
          //  console.warn(`[Wishlist Sync - ${userId}] Advertencia: No se encontraron filas para actualizar el usuario ${userId}. ¿Existe el usuario?`);
        }

        await transaction.commit();
       // console.log(`[Wishlist Sync - ${userId}] Transacción confirmada (COMMIT). Wishlist actualizada correctamente en la DB.`);

        res.status(200).json({ message: 'Wishlist actualizada correctamente.', wishlist: newWishlist });

    } catch (err) {
       // console.error(`[Wishlist Sync - ${req.user ? req.user.id : 'desconocido'}] ERROR GENERAL:`, err);
        // Si la transacción existe y está activa, hacer rollback
        if (transaction && transaction.aborted) { // transaction.aborted es true si ya falló
          //  console.error(`[Wishlist Sync - ${req.user ? req.user.id : 'desconocido'}] Transacción ya abortada.`);
        } else if (transaction) {
            try {
                await transaction.rollback();
              //  console.error(`[Wishlist Sync - ${req.user ? req.user.id : 'desconocido'}] Transacción revertida (ROLLBACK).`);
            } catch (rollbackErr) {
              //  console.error(`[Wishlist Sync - ${req.user ? req.user.id : 'desconocido'}] Error durante el ROLLBACK:`, rollbackErr);
            }
        }
        res.status(500).json({ error: 'Error interno del servidor al sincronizar la wishlist.' });
    }
});


// --- RUTAS ESPECÍFICAS PARA RESEÑAS ---
// Añade esta línea:
app.post('/api/reviews', protect, createReview); // Para crear una reseña (si la tienes protegida)
app.get('/api/reviews/book/:bookId', getReviewsByBookId); // ¡ESTA ES LA QUE TE FALTA Y CAUSA EL 404!


app.use(cors());
app.use(express.json());

// --- RUTA PARA OBTENER EL CARRITO DEL USUARIO (GET) ---

// Middlewares de Express
app.use(cors());
app.use(express.json());



// --- RUTA PARA OBTENER EL CARRITO DEL USUARIO (GET) ---

app.get('/api/cart', protect, async (req, res) => {
    // protect middleware asegura que req.user.id esté disponible
    const userId = req.user.id;

    console.log(`[BACKEND - GET /api/cart] Intentando obtener carrito para userId: ${userId}`);

    try {
        const request = new sql.Request(dbPool);
        request.input('userId', sql.Int, userId);

        // *** ¡CORRECCIÓN AQUÍ! Cambiado de 'Books' a 'Libros' ***
        const result = await request.query(`
            SELECT 
                b.id, 
                b.title, 
                A.name AS author, 
                b.price, 
                b.imageUrl,
                c.quantity, 
                b.description, 
                b.category, 
                b.year
            FROM Cart c
            JOIN Libros b ON c.BookID = b.id -- ¡CAMBIO AQUÍ!
               authors A ON L.author_id = A.id 
            WHERE c.UserID = @userId
        `);
        
        console.log(`[BACKEND - GET /api/cart] Carrito del usuario ${userId} cargado desde la DB: ${result.recordset.length} ítems.`);
        res.status(200).json(result.recordset); // Envía un array de objetos de libro completos
    } catch (err) {
        console.error(`[BACKEND - GET /api/cart] Error al obtener el carrito para el usuario ${userId}:`, err.message);
        res.status(500).json({ 
            error: 'Error interno del servidor al obtener el carrito.',
            details: err.message 
        });
    }
});


// --- RUTA PARA SINCRONIZAR EL CARRITO DEL USUARIO (PUT) ---

app.put('/api/cart/sync', protect, async (req, res) => {
    const userId = req.user.id; 


  const { cartItems } = req.body; // Ahora 'cartItems' debe ser un array de objetos { bookId, quantity }

 console.log(`[BACKEND - PUT /api/cart/sync] Sincronizando carrito para userId: ${userId}, ítems recibidos:`, cartItems);

 // INICIO DE MODIFICACIÓN: Validar que cada ítem del carrito tenga bookId y quantity
if (!Array.isArray(cartItems) || !cartItems.every(item => typeof item === 'object' && item !== null && 'bookId' in item && 'quantity' in item)) {
 console.error(`[BACKEND - PUT /api/cart/sync] ERROR: 'cartItems' no es un array de objetos con bookId y quantity. Recibido:`, cartItems);
 return res.status(400).json({ message: 'Los elementos del carrito deben ser un array de objetos con { bookId, quantity }.' });
}
// FIN DE MODIFICACIÓN
    try {
        const transaction = new sql.Transaction(dbPool); 
        await transaction.begin(); 

        try {
            // 1. Eliminar todos los elementos existentes del carrito para este usuario
            const request = new sql.Request(transaction);
            request.input('userId', sql.Int, userId);
            await request.query('DELETE FROM Cart WHERE UserID = @userId');
            console.log(`[BACKEND - PUT /api/cart/sync] Carrito existente del usuario ${userId} eliminado.`);

            // 2. Insertar los nuevos elementos del carrito, si hay alguno
            if (cartItems.length > 0) {
             let insertQuery = 'INSERT INTO Cart (UserID, BookID, Quantity) VALUES ';
            const values = [];
 // INICIO DE MODIFICACIÓN: Ahora 'item' es un objeto { bookId, quantity }
            cartItems.forEach((item, index) => {
            const bookIdParam = `bookId${index}`;
            const quantityParam = `quantity${index}`; // Definimos un parámetro para la cantidad

 // Aseguramos que la cantidad sea un número entero válido y positivo (mínimo 1)
            const safeQuantity = Math.max(1, parseInt(item.quantity, 10) || 1);

            request.input(bookIdParam, sql.Int, item.bookId); // Usamos item.bookId
            request.input(quantityParam, sql.Int, safeQuantity); // Pasamos la cantidad segura
            values.push(`(@userId, @${bookIdParam}, @${quantityParam})`); // Incluimos el nuevo parámetro de cantidad en la inserción
 });
 // FIN DE MODIFICACIÓN
                insertQuery += values.join(', ');
                
                await request.query(insertQuery);
                console.log(`[BACKEND - PUT /api/cart/sync] Se insertaron ${cartItems.length} nuevos ítems en el carrito del usuario ${userId}.`);
            } else {
                console.log(`[BACKEND - PUT /api/cart/sync] Carrito del usuario ${userId} vaciado (no se recibieron nuevos ítems).`);
            }

            await transaction.commit(); 
            console.log(`[BACKEND - PUT /api/cart/sync] Carrito sincronizado para el usuario ${userId} con ${cartItems.length} ítems.`);
            res.status(200).json({ message: 'Carrito sincronizado exitosamente.' });

        } catch (err) {
            await transaction.rollback(); 
            console.error(`[BACKEND - PUT /api/cart/sync] Error durante la transacción de sincronización del carrito para usuario ${userId}:`, err.message);
            res.status(500).json({ 
                error: 'Error interno del servidor al sincronizar el carrito.',
                details: err.message
            });
        }
    } catch (err) {
        console.error('[BACKEND - PUT /api/cart/sync] Error al iniciar la transacción o conectar al pool de DB:', err.message);
        res.status(500).json({ 
            error: 'Error interno del servidor al sincronizar el carrito.',
            details: err.message
        });
    }
});
app.post('/api/orders', async (req, res) => {
    // Ensure dbPool is available
    const pool = app.locals.db;
    if (!pool) {
        console.error('[API/ORDERS] Error: La conexión a la base de datos no está establecida.');
        return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
    }

    const { customerInfo, products, totalPrice, userId } = req.body;
    const { firstName, lastName, birthDate, gender, country, address, apartment, state, phone, email } = customerInfo;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !address || !state || !products || products.length === 0 || !totalPrice) {
        return res.status(400).json({ message: 'Faltan datos obligatorios para procesar la orden.' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido.' });
    }
    if (isNaN(totalPrice) || parseFloat(totalPrice) <= 0) {
        return res.status(400).json({ message: 'El precio total debe ser un número positivo.' });
    }

    let transaction; // Declare transaction here to ensure it's accessible in the catch block

    try {
        // Start a SQL transaction for atomicity (all or nothing)
        transaction = new sql.Transaction(pool);
        await transaction.begin();
        console.log('[API/ORDERS] Transacción de base de datos iniciada.');

        // 1. Insert the main order into the Orders table
        const orderRequest = new sql.Request(transaction);

        orderRequest.input('firstName', sql.NVarChar(255), firstName);
        orderRequest.input('lastName', sql.NVarChar(255), lastName);
        orderRequest.input('birthDate', sql.Date, birthDate); // Assuming BirthDate in DB is DATE
        orderRequest.input('gender', sql.NVarChar(50), gender);
        orderRequest.input('country', sql.NVarChar(255), country);
        orderRequest.input('address', sql.NVarChar(500), address);
        orderRequest.input('apartment', sql.NVarChar(255), apartment || null); // Can be NULL
        orderRequest.input('state', sql.NVarChar(255), state);
        orderRequest.input('phone', sql.NVarChar(50), phone);
        orderRequest.input('email', sql.NVarChar(255), email);
        orderRequest.input('totalPrice', sql.Decimal(10, 2), totalPrice);
        orderRequest.input('userId', sql.Int, userId || null); // userId can be null for guest checkout

        const orderInsertResult = await orderRequest.query(`
            INSERT INTO Orders (
                FirstName, LastName, BirthDate, Gender, Country, Address, Apartment, State, Phone, Email, TotalPrice, UserId, OrderDate
            )
            VALUES (
                @firstName, @lastName, @birthDate, @gender, @country, @address, @apartment, @state, @phone, @email, @totalPrice, @userId, GETDATE()
            );
            SELECT SCOPE_IDENTITY() AS OrderId; -- Returns the ID of the newly inserted order
        `);

        const orderId = orderInsertResult.recordset[0].OrderId;
        if (!orderId) {
            throw new Error('No se pudo obtener el ID de la orden después de la inserción.');
        }
        console.log(`[API/ORDERS] Orden principal ${orderId} insertada en la base de datos.`);

        // 2. Insert order items into the OrderItems table
        for (const item of products) {
            const itemRequest = new sql.Request(transaction);
            itemRequest.input('orderId', sql.Int, orderId);
       itemRequest.input('productId', sql.Int, item.productId);
            itemRequest.input('title', sql.NVarChar(500), item.title);
            itemRequest.input('quantity', sql.Int, item.quantity);
            itemRequest.input('price', sql.Decimal(10, 2), item.price);
              console.log(`[DEBUG] item.productId: ${item.productId}, typeof item.productId: ${typeof item.productId}`);

            await itemRequest.query(`
                INSERT INTO OrderItems (OrderId, ProductId, Title, Quantity, Price)
                VALUES (@orderId, @productId, @title, @quantity, @price);
            `);
        }
        console.log(`[API/ORDERS] Ítems de la orden ${orderId} insertados en la base de datos.`);

        // 3. Send the confirmation email
        const productsHtml = products.map(item => `<li>${item.title} (x${item.quantity}) - €${(item.price * item.quantity).toFixed(2)}</li>`).join('');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email, // Send to the customer's email
            bcc: process.env.EMAIL_USER, // Optional: send a blind copy to your business email
            subject: `Confirmación de Pedido #${orderId} - Booksflea`,
            html: `
                <h2>¡Hola ${firstName}!</h2>
                <p>Gracias por tu compra. Hemos recibido tu pedido <strong>#${orderId}</strong> y lo estamos procesando.</p>
                <h3>Detalles de tu pedido:</h3>
                <ul>
                    ${productsHtml}
                </ul>
                <p><strong>Total del Pedido: €${totalPrice.toFixed(2)}</strong></p>
                <p>En breve nos pondremos en contacto contigo por teléfono para coordinar el pago y el envío.</p>
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                <p>Saludos cordiales,</p>
                <p>El equipo de Booksflea</p>
            `,
        };
        await mailTransporter.sendMail(mailOptions); // Use mailTransporter, not 'transporter'
        console.log(`[API/ORDERS] Email de confirmación enviado a ${email} para la orden ${orderId}`);

        // Commit the transaction if all operations were successful
        await transaction.commit();
        console.log('[API/ORDERS] Transacción de base de datos confirmada exitosamente.');

        res.status(200).json({ message: 'Orden procesada y email enviado con éxito.', orderId: orderId });

    } catch (error) {
        // If an error occurs, roll back the transaction
        if (transaction && transaction.aborted !== true) { // Check if transaction exists and hasn't been aborted already
            try {
                await transaction.rollback();
                console.error('[API/ORDERS] Transacción de base de datos revertida debido a un error.');
            } catch (rollbackErr) {
                console.error('[API/ORDERS] Error al revertir la transacción:', rollbackErr);
            }
        }
        console.error('[API/ORDERS] Error al procesar la orden o enviar el email:', error.message || error);
        res.status(500).json({ message: 'Error interno del servidor al procesar su pedido.', details: error.message });
    }
});

app.get('/api/orders', async (req, res) => {
    const pool = app.locals.db; // Tu conexión a SQL Server
    if (!pool) {
        return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
    }

    try {
        const request = new sql.Request(pool);
        // Esta consulta selecciona los campos relevantes para tu tabla
        const result = await request.query(`
           SELECT
    O.OrderId,
    O.OrderDate,
    O.TotalPrice,
    O.Address,
    O.Country,
    O.State,
    (SELECT COUNT(*) FROM OrderItems WHERE OrderItems.OrderId = O.OrderId) AS NumberOfItems
FROM Orders O
ORDER BY O.OrderDate DESC;
        `);

        const orders = result.recordset.map(order => ({
            id: `#${order.OrderId}`,
            date: new Date(order.OrderDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'Completado', // Si no tienes un campo de estado en la DB, puedes usar un valor por defecto o determinarlo aquí
            total: `$${order.TotalPrice.toFixed(2)} para ${order.NumberOfItems || 0} articulo${(order.NumberOfItems || 0) !== 1 ? 's' : ''}`,
            direccion:`${order.Address} ${order.State} ${order.Country} ` 
        }));

        res.json(orders);
    } catch (err) {
        console.error('Error al obtener los pedidos para el frontend:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener los pedidos.' });
    }
});

// Nueva ruta GET para obtener los ítems de un pedido específico
app.get('/api/orders/:orderId/items', async (req, res) => {
    // Extrae el orderId de los parámetros de la URL
    const orderId = req.params.orderId;

    // Accede al pool de conexión a la base de datos desde app.locals
    const pool = app.locals.db;

    // Verifica que el pool de conexión esté disponible
    if (!pool) {
        console.error('[API/ORDER_ITEMS] Error: La conexión a la base de datos no está establecida.');
        return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
    }

    // Validación básica del orderId
    if (!orderId || isNaN(parseInt(orderId))) {
        return res.status(400).json({ message: 'ID de pedido inválido.' });
    }

    try {
        // Crea una nueva solicitud SQL usando el pool
        const request = new sql.Request(pool);

        // Agrega el orderId como un input para prevenir inyección SQL
        request.input('orderId', sql.Int, parseInt(orderId));

        // Ejecuta la consulta para obtener los ítems del pedido
        const result = await request.query(`
            SELECT
                OrderItemId,
                ProductId,
                Title,      -- El título del artículo
                Quantity,   -- La cantidad del artículo
                Price       -- El precio unitario del artículo
                
            FROM
                OrderItems
            WHERE
                OrderId = @orderId;
        `);

        // Envía los ítems encontrados como respuesta JSON
        res.status(200).json(result.recordset);

    } catch (err) {
        console.error(`[API/ORDER_ITEMS] Error al obtener ítems para el pedido ${orderId}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener los ítems del pedido.', details: err.message });
    }
});

app.get('/api/orders/user/:userId', async (req, res) => {
    const pool = app.locals.db; // Your SQL Server connection pool
    const userId = req.params.userId; // Get userId from the URL parameter


    if (!pool) {
        console.error('[API/ORDERS/USER] Error: La conexión a la base de datos no está establecida.');
        return res.status(500).json({ error: 'La conexión a la base de datos no está establecida.' });
    }

    // Basic validation for userId
    if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({ message: 'ID de usuario inválido.' });
    }

    try {
        const request = new sql.Request(pool);
        request.input('userId', sql.Int, parseInt(userId)); // Add userId as an input parameter

        // Query to get orders for a specific user.
        // This query is similar to your existing GET /api/orders, but filtered by UserId.
        const result = await request.query(`
            SELECT
                O.OrderId,
                O.OrderDate,
                O.TotalPrice,
                O.Address,
                O.Country,
                O.State,
                (SELECT COUNT(*) FROM OrderItems WHERE OrderItems.OrderId = O.OrderId) AS NumberOfItems
            FROM Orders O
            WHERE O.UserId = @userId -- Filter by the provided UserId
            ORDER BY O.OrderDate DESC;
        `);

        // Format the results similarly to your existing /api/orders route
        const orders = result.recordset.map(order => ({
            id: `#${order.OrderId}`,
            date: new Date(order.OrderDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'Completado', // Default status, adjust if you have a status field in DB
            total: `$${order.TotalPrice.toFixed(2)} para ${order.NumberOfItems || 0} articulo${(order.NumberOfItems || 0) !== 1 ? 's' : ''}`,
            direccion: `${order.Address} ${order.State} ${order.Country} `
        }));

        res.status(200).json(orders);

    } catch (err) {
        console.error(`[API/ORDERS/USER] Error al obtener pedidos para el usuario ${userId}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener los pedidos del usuario.', details: err.message });
    }
});

app.post('/api/reviews', protect, createReview);

app.get('/api/reviews/:bookId', getReviewsByBookId);



// Iniciar el servidor Express
app.listen(port, () => {
    console.log(`Backend API escuchando en http://localhost:${port}`);
});



// Manejar el cierre del pool de conexión al apagar la aplicación
process.on('SIGTERM', () => {
    if (dbPool) {
        dbPool.close();
        console.log('Pool de SQL Server cerrado.');
    }
});

process.on('SIGINT', () => { // También para Ctrl+C en la terminal
    if (dbPool) {
        dbPool.close();
        console.log('Pool de SQL Server cerrado.');
    }
    process.exit();
});