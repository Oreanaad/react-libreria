// paginareact/Backend/models/badge.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Badge = sequelize.define('Badge', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            field: 'name'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        imageUrl: {
            type: DataTypes.STRING(1000),
            allowNull: true,
            field: 'imageUrl'
        },
       
    }, {
        tableName: 'Badges', // Asegúrate de que coincida con el nombre de tu tabla
        timestamps: false,
        underscored: true
    });

    Badge.associate = (models) => {
        // Un Badge tiene muchos usuarios, a través de la tabla de unión UserBadge
        Badge.belongsToMany(models.User, {
            through: models.UserBadge,
            foreignKey: 'badgeId',
            as: 'users'
        });
    };

    return Badge;
};