// paginareact/Backend/models/orderItem.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OrderItem = sequelize.define('OrderItem', {
        orderItemId: { // O 'id' si tu columna se llama así y es la PK
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'OrderItemId' // Nombre de la columna en la base de datos
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'OrderId'
        },
        productId: { // Asumiendo que es el ID del libro
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'ProductId'
        },
        title: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: 'Title'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'Quantity',
            validate: {
                min: 1
            }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'Price'
        },
     
    }, {
        tableName: 'OrderItems', // Asegúrate de que coincida con tu tabla
        timestamps: false,
        underscored: false
    });

    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
        OrderItem.belongsTo(models.Book, { foreignKey: 'productId', as: 'product' }); // Si ProductId es el ID del libro
    };
    return OrderItem;
};