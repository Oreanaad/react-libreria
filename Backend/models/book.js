// paginareact/Backend/models/book.js
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL(10, 2),
    oldPrice: DataTypes.DECIMAL(10, 2),
    imageUrl: DataTypes.STRING,
    detailsLink: DataTypes.STRING,
    rating: DataTypes.DECIMAL(2, 1),
    discountPercentage: DataTypes.INTEGER,
    category: DataTypes.STRING(50),
    year: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    authorId: { 
      type: DataTypes.INTEGER,
      field: 'authorId', 
      allowNull: true, 
      references: {
        model: 'authors',
        key: 'id',
      }
    },
    type: DataTypes.STRING(50),
  }, {
    tableName: 'libros',
    timestamps: false,
    underscored: false
  });

   Book.associate = function(models) {
    Book.belongsTo(models.Author, {
      // CAMBIO CRÍTICO: Usa `foreignKey` para especificar la columna en el modelo actual.
      foreignKey: {
        name: 'authorId',
        field: 'authorId' // Este campo fuerza el nombre de la columna en la consulta
      },
      as: 'authorData',
      constraints: false, 
      allowNull: true
    });
  };
  return Book;
};