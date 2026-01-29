// paginareact/Backend/models/cart.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Cart = sequelize.define('Cart', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'UserID' // ¡Atención al nombre de la columna en tu DB!
        },
        bookId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'BookID' // ¡Atención al nombre de la columna en tu DB!
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'Quantity',
            defaultValue: 1, // Por defecto 1 si no se especifica
            validate: {
                min: 1 // Asegura que la cantidad sea al menos 1
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'createdAt'
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'updatedAt'
        }
    }, {
        tableName: 'Cart', // Asegúrate de que coincida con tu tabla
        timestamps: false,
        underscored: true,
        indexes: [ // Para asegurar que no haya duplicados de un mismo libro para un mismo usuario
            {
                unique: true,
                fields: ['UserID', 'BookID']
            }
        ]
    });

    Cart.associate = (models) => {
        Cart.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Cart.belongsTo(models.Book, { foreignKey: 'bookId', as: 'book' });
    };
    return Cart;
};