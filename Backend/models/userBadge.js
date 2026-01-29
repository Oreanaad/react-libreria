// paginareact/Backend/models/userBadge.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserBadge = sequelize.define('UserBadge', {
        id: { // Un ID propio para esta tabla si quieres. Si no, las PKs compuestas son userId y badgeId
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
        badgeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'badgeId'
        },
        awardedAt: { // Fecha en que se le otorgó la insignia al usuario
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'awardedAt'
        },
  
    }, {
        tableName: 'UserBadges', // Asegúrate de que coincida con el nombre de tu tabla
        timestamps:false,
        underscored: true,
        indexes: [ // Para asegurar unicidad si un usuario solo puede tener una instancia de una insignia
            {
                unique: true,
                fields: ['userId', 'badgeId']
            }
        ]
    });

    UserBadge.associate = (models) => {
        UserBadge.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        UserBadge.belongsTo(models.Badge, { foreignKey: 'badgeId', as: 'badge' });
    };

    return UserBadge;
};