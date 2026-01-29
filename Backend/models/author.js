module.exports = (sequelize, DataTypes) => {
  const Author = sequelize.define('Author', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING(255),
    description: DataTypes.TEXT,
    image_url: DataTypes.STRING(255), // Si esta columna es `image_url` en DB
    category: DataTypes.STRING(50),
    famous_quote: DataTypes.TEXT, // Si esta columna es `famous_quote` en DB
    best_book_title: DataTypes.STRING(255), // Si esta columna es `best_book_title` en DB
  }, {
    tableName: 'authors', // <-- ¡AJUSTADO a 'authors' (minúscula) para coincidir con tu DB!
    timestamps: false,
    underscored: true // Mantener 'true' si tus columnas en Authors son snake_case (como las que te puse de ejemplo)
  });

  Author.associate = function(models) {
    Author.hasMany(models.Book, {
      foreignKey: 'author_id',
      as: 'books',
    });
  };

  return Author;
};