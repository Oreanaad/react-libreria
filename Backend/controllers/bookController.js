// Backend/controllers/bookController.js

const { Book, Author } = require('../models');
const { Op } = require('sequelize');
const sql = require('mssql');
// Asegúrate de que esta ruta sea correcta y que config.js exporte los objetos development/production
const allConfigs = require('../config/config'); 

const bookController = {
 getAllBooks: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const category = req.query.category;
            const searchTerm = req.query.search;

            const offset = (page - 1) * limit;

            let whereClause = {};

            if (category && category !== 'All') {
                whereClause.category = category;
            }

            if (searchTerm) {
                whereClause.title = { [Op.like]: `%${searchTerm}%` };
            }

            const { count, rows: books } = await Book.findAndCountAll({
                where: whereClause,
                // CAMBIO CRÍTICO: Usamos `attributes` para especificar las columnas que queremos.
                attributes: [
                    'id', 'title', 'description', 'price', 'oldPrice', 'imageUrl',
                    'detailsLink', 'rating', 'discountPercentage', 'category', 'year',
                    'quantity', 'authorId', 'type'
                ],
                include: [{ 
                    model: Author, 
                    as: 'authorData',
                    // Opcional: especificar atributos para Author si es necesario
                    // attributes: ['id', 'name', 'description', 'image_url', /* ... */]
                }],
                limit: limit,
                offset: offset,
                order: [['title', 'ASC']]
            });

            const totalPages = Math.ceil(count / limit);

            res.json({
                books,
                currentPage: page,
                totalPages,
                totalItems: count
            });

        } catch (error) {
            console.error('Error al obtener libros con paginación:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener libros.' });
        }
    },

    getBookById: async (req, res) => {
        let pool; // Declara 'pool' fuera del bloque 'try' para poder acceder a él en el 'finally'
        try {
            const { id } = req.params;

            if (isNaN(id)) {
                return res.status(400).json({ message: 'El ID proporcionado no es válido.' });
            }

            const env = process.env.NODE_ENV || 'development';
            const currentConfig = allConfigs[env];

            // Construye el objeto de configuración para 'mssql'
            // NOTA: Se ha quitado `pool: currentConfig.pool` de aquí porque Tarn maneja sus propias opciones de pool internamente
            const mssqlConfig = {
                user: currentConfig.username,
                password: currentConfig.password,
                server: currentConfig.host,
                database: currentConfig.database,
                options: {
                    encrypt: currentConfig.dialectOptions.options.encrypt,
                    trustServerCertificate: currentConfig.dialectOptions.options.trustServerCertificate,
                    // Si quieres usar el puerto:
                    // port: parseInt(process.env.DB_PORT) || 1433
                }
                // Las opciones de pool de Tarn se pasan directamente al constructor de Pool en mssql,
                // o se recogen automáticamente si se especifican dentro del objeto de configuración principal
                // según la documentación de mssql.
                // Sin embargo, pasar currentConfig.pool directamente aquí parece ser la causa del error 'Tarn: unsupported option opt.acquire'.
            };

            // Inicializa una nueva instancia de ConnectionPool con la configuración específica de mssql
            // Las opciones del pool como max, min, acquire, idle deberían ser parte del objeto de configuración principal
            // y mssql las recoge, o puedes pasarlas así:
            pool = new sql.ConnectionPool({
                ...mssqlConfig, // Extiende los detalles básicos de conexión
                // Añade las opciones específicas del pool directamente al nivel superior de este objeto
                // si no son recogidas automáticamente por mssql del objeto 'currentConfig'.
                // Si el error persiste, asegúrate de que currentConfig.pool.acquire/idle sean compatibles.
                // O elimínalas de config.js si no necesitas un control tan granular para mssql directamente.
                max: currentConfig.pool.max,
                min: currentConfig.pool.min,
                // La opción 'acquire' de Tarn es para 'timeout' en la configuración de mssql, no es un 'acquire' directo.
                // Es probable que los `acquire` e `idle` de Sequelize no sean directamente compatibles
                // con las opciones de pool subyacentes de mssql tal como las has definido.
                // Vamos a eliminarlos de aquí por ahora para solucionar el error de Tarn.
                // Puedes volver a añadir `connectionTimeout` o `requestTimeout` si es necesario.
            });

            await pool.connect();
            let result = await pool.request()
                .input('bookId', sql.Int, id)
                .query(`
                    SELECT
                        l.*,
                        a.id AS author_id_author,
                        a.name AS author_name,
                        a.description AS author_description,
                        a.image_url AS author_image_url,
                        a.category AS author_category,
                        a.famous_quote AS author_famous_quote,
                        a.best_book_title AS author_best_book_title
                    FROM
                        dbo.libros l
                    JOIN
                        dbo.authors a ON l.authorId = a.id
                    WHERE
                        l.id = @bookId
                `);

            if (result.recordset.length > 0) {
                const bookData = result.recordset[0];
                const bookWithAuthor = {
                    id: bookData.id,
                    title: bookData.title,
                    description: bookData.description,
                    price: bookData.price,
                    oldPrice: bookData.oldPrice,
                    imageUrl: bookData.imageUrl,
                    detailsLink: bookData.detailsLink,
                    rating: bookData.rating,
                    discountPercentage: bookData.discountPercentage,
                    category: bookData.category,
                    year: bookData.year,
                    quantity: bookData.quantity,
                    authorId: bookData.authorId,
                    type: bookData.type,
                    authorData: {
                        id: bookData.authorId_author,
                        name: bookData.author_name,
                        description: bookData.author_description,
                        image_url: bookData.author_image_url,
                        category: bookData.author_category,
                        famous_quote: bookData.author_famous_quote,
                        best_book_title: bookData.best_book_title // Asegúrate de que esto se mapea correctamente si viene de la DB así
                    }
                };
                res.json(bookWithAuthor);
            } else {
                res.status(404).json({ message: 'Libro no encontrado.' });
            }

        } catch (err) {
            console.error('Error al obtener libro por ID:', err);
            res.status(500).json({ message: 'Error interno del servidor al obtener el libro.' });
        } finally {
            // Solo cierra el pool si se creó y conectó exitosamente
            if (pool && pool.connected) {
                try {
                    await pool.close();
                } catch (closeErr) {
                    console.error('Error al cerrar el pool de mssql:', closeErr);
                }
            }
            // Se quitó la comprobación de sql.pools.default, ya que estás creando un nuevo pool específico
            // y esta comprobación global podría no reflejar siempre su estado.
        }
    },


    // --- AÑADIDO: Placeholder para la función createBook ---
    createBook: async (req, res) => {
        try {
            res.status(200).json({ message: 'createBook function is working! Implement your logic here.' });
        } catch (error) {
            console.error('Error al crear libro:', error);
            res.status(500).json({ message: 'Error interno del servidor al crear el libro.' });
        }
    }
    // ----------------------------------------------------
};

module.exports = bookController;