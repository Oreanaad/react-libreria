// Backend/models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id' // Solo para ser explícito, aunque es el default
    },
    username: {
      type: DataTypes.STRING(50), // Usa el mismo tamaño que en tu DB (nvarchar(50))
      allowNull: false,
      unique: true // Asegúrate de que esto también se refleje en tu DB si es una restricción
    },
    email: {
      type: DataTypes.STRING(255), // Usa el mismo tamaño (nvarchar(255))
      allowNull: false,
      unique: true
    },
    passwordHash: { // Nombre que tienes en tu DB para la contraseña hasheada
      type: DataTypes.STRING(255), // Usa el mismo tamaño (nvarchar(255))
      allowNull: false
    },
    createdAt: { // Si tu DB tiene 'createdAt' en camelCase
      type: DataTypes.DATE, // Sequelize lo mapea a datetime
      allowNull: true, // Según tu DB
      field: 'createdAt' // Asegura que mapea a la columna 'createdAt'
    },
    isConfirmed: {
      type: DataTypes.BOOLEAN, // Sequelize lo mapea a bit
      allowNull: true, // Según tu DB
      field: 'isConfirmed'
    },
    // **CORRECCIÓN AQUÍ:** Usa 'field' para mapear a los nombres de la DB
    emailConfirmToken: {
      type: DataTypes.STRING(255),
      allowNull: true, // Según tu DB
      field: 'emailConfirmToken' // Mapea a la columna real 'emailConfirmToken'
    },
    emailConfirmExpires: {
      type: DataTypes.DATE,
      allowNull: true, // Según tu DB
      field: 'emailConfirmExpires' // Mapea a la columna real 'emailConfirmExpires'
    },
    Wishlist: {
      type: DataTypes.TEXT, // nvarchar(MAX) se mapea a TEXT en Sequelize
      allowNull: true, // Si tu DB permite nulls, si no, pon false
      field: 'Wishlist'
    },
    Cart: { // Añade Cart si lo tienes en tu DB y quieres usarlo
        type: DataTypes.TEXT, // nvarchar(MAX)
        allowNull: true, // Si permite nulls
        field: 'Cart'
    },
    firstName: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    birthDate: {
        type: DataTypes.DATEONLY, // Usar DATEONLY si solo guardas la fecha sin hora
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    address: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    apartment: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    state: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
  }, {
    tableName: 'Users', // Nombre real de tu tabla de usuarios
    timestamps: true, // TRUE si tu DB tiene 'createdAt' y 'updatedAt'
    updatedAt: false, // FALSE si NO tienes una columna 'updatedAt' en tu DB
    underscored: false // FALSE si tus columnas en DB son camelCase (ej. createdAt, passwordHash)
  });

 
  User.associate = function(models) {
 
    User.belongsToMany(models.Badge, {
        through: models.UserBadge,
        foreignKey: 'userId',
        as: 'badges'
    });
  };

  return User;
};