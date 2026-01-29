// paginareact/Backend/models/order.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Order = sequelize.define('Order', {
        orderId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'OrderId'
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'CustomerID'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'UserID'
        },
        orderDate: {
            type: DataTypes.DATE,
             defaultValue: sequelize.literal("GETDATE()"),
            allowNull: false,
            field: 'OrderDate'
        },
        totalPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'TotalPrice'
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'Status'
        },
        deliveryAddress: { // Corregido a deliveryAddress para consistencia
            type: DataTypes.STRING(500),
            allowNull: true,
            field: 'DeliveryAddress'
        },
        deliveryState: { // Corregido a deliveryState para consistencia
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'DeliveryState'
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'Email',
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'Phone'
        },
        firstName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'FirstName'
        },
        lastName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'LastName'
        },
        address: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: 'Address'
        },
        apartment: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'Apartment'
        },
        state: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'State'
        },
        country: {
            type: DataTypes.STRING(255),
            allowNull: false, // ¡Corregido según tu diseño de tabla!
            field: 'Country'
        },
        birthDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'BirthDate'
        },
        gender: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'Gender'
        },
    }, {
        tableName: 'Orders',
        timestamps: false,
        underscored: false
    });

    Order.associate = (models) => {
        Order.belongsTo(models.User, { foreignKey: 'userId', as: 'customer' });
        Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
    };

    return Order;
};
