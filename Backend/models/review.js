// Backend/models/review.js
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: { // Asegúrate que es 'id' en tu DB, si no, usa 'review_id' con field: 'review_id'
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      // Ya NO necesitas `field: 'review_id'` si lo cambiaste en la DB
    },
    bookId: { // Asegúrate que es 'bookId' en tu DB, si no, usa 'book_id' con field: 'book_id'
      type: DataTypes.INTEGER,
      allowNull: false,
      // Ya NO necesitas `field: 'book_id'`
    },
    userId: { // Asegúrate que es 'userId' en tu DB, si no, usa 'user_id' con field: 'user_id'
      type: DataTypes.INTEGER,
      allowNull: false,
      // Ya NO necesitas `field: 'user_id'`
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: { // Asegúrate que es 'createdAt' en tu DB, si no, usa 'created_at' con field: 'created_at'
        type: DataTypes.DATE,
        // Si cambiaste 'created_at' a 'createdAt' en la DB, no necesitas 'field'
        // Si no lo cambiaste y sigue siendo 'created_at', necesitarías: field: 'created_at'
    }
    // No definas 'updatedAt' aquí
  }, {
    tableName: 'Reviews',
    timestamps: true, // Mantén esto en true si quieres que Sequelize maneje createdAt.
    updatedAt: false, // <-- ¡AGREGA ESTO! Le dice a Sequelize que no busque ni gestione 'updatedAt'.
    underscored: false // Si todas tus columnas están en camelCase en la DB
    // Si no cambiaste los nombres en la DB y sigues con snake_case (book_id, user_id, created_at),
    // entonces la configuración anterior con `field` y `underscored: true` era correcta y solo deberías agregar `updatedAt: false`.
  });

  Review.associate = function(models) {
    Review.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Review.belongsTo(models.Book, { foreignKey: 'bookId', as: 'bookData' });
  };

  return Review;
};