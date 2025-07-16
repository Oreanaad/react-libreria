// src/components/CategoryFilterCarousel.jsx
import React, { useState } from 'react';
import './CategoryFilterCarousel.css'; // Crearás este archivo CSS en el paso 2

const CategoryFilterCarousel = ({ categories, onSelectCategory, activeCategory }) => {
  const [startIndex, setStartIndex] = useState(0); // Índice del primer botón visible
  const itemsPerPage = 8; // Mostrar 8 botones a la vez

  const totalCategories = categories.length;
  const totalSets = Math.ceil(totalCategories / itemsPerPage);
  //const currentSet = Math.floor(startIndex / itemsPerPage);

  const goToNextSet = () => {
    const newStartIndex = startIndex + itemsPerPage;
    // Si llegamos al final, volvemos al principio, si no, avanzamos
    setStartIndex(newStartIndex >= totalCategories ? 0 : newStartIndex);
  };

  const goToPreviousSet = () => {
    const newStartIndex = startIndex - itemsPerPage;
    // Si estamos al principio, vamos al final, si no, retrocedemos
    setStartIndex(newStartIndex < 0 ? (totalSets - 1) * itemsPerPage : newStartIndex);
  };

  // Slice (cortar) el array de categorías para mostrar solo los que corresponden al "grupo" actual
  const visibleCategories = categories.slice(startIndex, startIndex + itemsPerPage);

  // Mostrar flechas solo si hay más categorías que las que caben en una vista
  const showArrows = totalCategories > itemsPerPage; 

  // Deshabilitar flechas si no hay más sets (opcional)
  const disablePrev = startIndex === 0 && !showArrows; // Si ya está en el inicio y no hay scroll
  const disableNext = (startIndex + itemsPerPage >= totalCategories) && !showArrows; // Si ya está al final y no hay scroll
 
  
   const translateCategory = (categoryEn) => {
    switch (categoryEn) {
      case '': return 'Todas'; // Para el botón "Todas"
      case 'Fiction': return 'Ficción';
      case 'Fantasy': return 'Fantasía';
      case 'Sci-Fi': return 'Ciencia Ficción';
      case 'Thriller': return 'Thriller';
      case 'Romance': return 'Romance';
      case 'Biography': return 'Biografía';
      case 'History': return 'Historia';
      case 'Childrens': return 'Infantil';
      case 'Mystery': return 'Misterio';
      case 'Classic': return 'Clásico';
      case 'Non-Fiction': return 'No Ficción';
      case 'Poetry': return 'Poesía';
      case 'Cooking': return 'Cocina';
      case 'Philosophy': return 'Filosofía';
      case 'Horror': return 'Terror';
      case 'Gothic Fiction': return 'Ficción Gótica';
      case 'Historical Fiction': return 'Ficción Histórica';
      case 'Education': return 'Educación';
      // ¡IMPORTANTE! Añade aquí cualquier otra categoría que tengas en tu DB si no está en la lista.
      default: return categoryEn; // Si no hay traducción, muestra el nombre original (en inglés)
    }
  };


  return (
    <div className="category-carousel-container">
      {/* Botón de flecha izquierda */}
      {showArrows && (
        <button 
          onClick={goToPreviousSet} 
          className="carousel-arrow left-arrow"
          disabled={disablePrev}
        >
          &lt;
        </button>
      )}

      {/* Contenedor de los botones visibles */}
      <div className="carousel-buttons-wrapper">
        <ul>
          {visibleCategories.map(category => (
            <button 
              key={category} // Usar el nombre de la categoría como key
              onClick={() => onSelectCategory(category)} // Llama a la función del padre
              className={activeCategory === category ? 'active' : ''}
            >
                {translateCategory(category)} {/* <-- ¡AQUÍ SE USA LA FUNCIÓN PARA EL TEXTO DEL BOTÓN! */}
             
            </button>
          ))}
        </ul>
      </div>

      {/* Botón de flecha derecha */}
      {showArrows && (
        <button 
          onClick={goToNextSet} 
          className="carousel-arrow right-arrow"
          disabled={disableNext}
        >
          &gt;
        </button>
      )}
    </div>
  );
};

export default CategoryFilterCarousel;