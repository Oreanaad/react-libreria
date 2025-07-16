// src/pages/Tienda.jsx

import React, { useState, useEffect, useRef, useLayoutEffect} from 'react';
 import BookCard from '../Index/BookCard';
 import '../../components/Index/BookCard.css';
 import '../../components/Index/BookList.css';
 import '../Index/BookList.css'
 import '../Tienda/CategoryFilterCarousel'
 import SectionHeader from '../Index/SectionHeader';
import CategoryFilterCarousel from '../Tienda/CategoryFilterCarousel';
import { useSearch } from '../../context/SearchContext';
//import { renderStars } from '../../hooks/RenderStars'; 
const API_URL = 'http://localhost:3001/api/libros'; 
// Cuando despliegues tu backend, esta URL cambiará a la de tu servidor en la nube (ej. https://api.tu-tienda.com/api/libros)

function TiendaNew() {

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1); 
  const booksPerPage = 20; // Define cuántos libros por página quieres
  const [category, setCategory] = useState('');
  const scrollPositionRef = useRef(null);  //Guardamos la posición del scroll actual 

  const allAvailableCategories = [
    '', // Para el botón "Todas"
    'Fiction', 'Fantasy', 'Sci-Fi', 'Thriller', 'Romance', 
    'Biography', 'History', 'Childrens', 'Mystery', 'Classic', 
    'Non-Fiction', 'Poetry', 'Cooking', 'Philosophy', 'Horror', 
    'Gothic Fiction', 'Historical Fiction', 'Education' // Agrega todas tus categorías aquí
    
];
  const { searchTerm } = useSearch();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true); // Vuelve a poner loading en true en cada cambio de página
        setError(null); // Limpia errores anteriores

        // --- Construye la URL con parámetros de paginación (y filtros si los añades) ---
        let url = `${API_URL}?page=${currentPage}&limit=${booksPerPage}`;

     if (category) { // Si hay una categoría seleccionada, añádela a la URL
          url += `&category=${encodeURIComponent(category)}`;
        }
        if (searchTerm) {
  url += `&search=${encodeURIComponent(searchTerm)}`;
}
        console.log("Fetching URL:", url); // Para depuración
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error HTTP! Estado: ${response.status}`);
        }
        // CRÍTICO: La API devuelve un OBJETO con 'books', 'currentPage', etc.
        const data = await response.json(); 

        setBooks(data.books); // ¡Actualiza el estado con el array 'books' de la respuesta!
        setCurrentPage(data.currentPage); // Actualiza la página actual
        setTotalPages(data.totalPages); // Actualiza el total de páginas
        
      } catch (err) {
        setError(err);
        console.error("Error al cargar libros desde la API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, category, searchTerm]); // <--- DEPENDENCIA: useEffect se re-ejecuta cuando 'currentPage' cambie

  
useLayoutEffect(() => {
  if (scrollPositionRef.current !== null) {
    window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
    scrollPositionRef.current = null; // Reseteamos para que no se use otra vez
  }
}, [books]);

  // --- Funciones para cambiar de página ---
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1); // Avanza a la siguiente página
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1); // Retrocede a la página anterior
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber); // Ir a una página específica
    }
  };
const handleCategoryFilter = (selectedCategory) => {
  scrollPositionRef.current = window.scrollY; // Guarda la posición actual
  setCategory(selectedCategory);
  setCurrentPage(1);
};


  if (loading) {
    return <div className="tienda-loading">Cargando libros de la tienda...</div>;
  }

  if (error) {
    return <div className="tienda-error">Error al cargar la tienda: {error.message}</div>;
  }

  if (books.length === 0 && !loading) {
    return <div className="tienda-no-books">No hay libros disponibles en la tienda.</div>;
  }

 

   return (
    <>

      <div className="">
          <SectionHeader icon="N" title="Nuestra Tienda" className='section-line-tienda'/>
      <div className="filters-container">
           
        <CategoryFilterCarousel  categories={allAvailableCategories} // <-- AQUÍ se usa 'allAvailableCategories'
                                onSelectCategory={handleCategoryFilter} 
                                activeCategory={category} >
            
          </CategoryFilterCarousel>
          
        </div>
            <div className="section-line-tienda"></div>
        <div className="book-list-grid">
          {books.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

  
        {totalPages > 1 && ( // Mostrar paginación solo si hay más de 1 página
          <div className="pagination-controls">
            <button onClick={goToPrevPage} disabled={currentPage === 1} className="pagination-button">Anterior</button>
            
            {/* Botones de número de página (1, 2, 3...) */}
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => goToPage(index + 1)}
                className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}

            <button onClick={goToNextPage} disabled={currentPage === totalPages} className="pagination-button">Siguiente</button>
          </div>
        )}
       
      </div>
    </>
  );
}

export default TiendaNew;