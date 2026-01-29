// Backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const db = require('./models'); // Esto SOLO carga la definición, no establece la conexión
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const authorRoutes = require('./routes/authorRoutes');
const cartRoutes = require('./routes/cartRoutes'); 
const wishlistRoutes = require('./routes/wishListRoutes'); 
const orderRoutes = require('./routes/orderRoutes');


// 3. MIDDLEWARES (se definen una sola vez y para toda la app)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. RUTAS (se definen todas juntas y de forma síncrona)
app.use('/api', bookRoutes);
app.use('/api', reviewRoutes);
app.use('/api', authorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// 5. FUNCIÓN PARA INICIAR EL SERVIDOR
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`✅ Backend API escuchando en http://localhost:${PORT}`);
    });
};

// 6. CONEXIÓN A LA BASE DE DATOS Y ARRANQUE DEL SERVIDOR
db.sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a la base de datos establecida exitosamente.');
        // Puedes sincronizar aquí si es necesario, aunque a menudo no se recomienda en producción.
        // return db.sequelize.sync(); 
    })
    .then(() => {
        // console.log('📊 Modelos sincronizados con la base de datos.');
        startServer(); // Inicia el servidor SOLO si la conexión a la DB es exitosa
    })
    .catch(err => {
        console.error('❌ Error al conectar la base de datos:', err);
        process.exit(1); // Detiene la aplicación si no se puede conectar a la DB
    });