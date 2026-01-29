// paginareact/Backend/models/passwordResetToken.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PasswordResetToken = sequelize.define('PasswordResetToken', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'userId'
        },
        token: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            field: 'token'
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'expiresAt'
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
        tableName: 'PasswordResetTokens', // Asegúrate de que coincida con tu tabla
        timestamps: false,
        underscored: true
    });

    PasswordResetToken.associate = (models) => {
        PasswordResetToken.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return PasswordResetToken;
};