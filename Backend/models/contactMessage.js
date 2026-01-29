// paginareact/Backend/models/contactMessage.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ContactMessage = sequelize.define('ContactMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'name'
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'email'
        },
        subject: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: 'subject'
        },
        service: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'service'
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'message'
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
        tableName: 'ContactMessages', // Asegúrate de que coincida con tu tabla
        timestamps: false,
        underscored: true
    });
    return ContactMessage;
};