import React, { useState, useEffect } from 'react';
import BookList from './BookList'; // Ruta relativa a BookList
import SectionHeader from './SectionHeader'; // Ruta relativa a SectionHeader
import axios from 'axios'; // 
import AuthorList from './AuthorList';

const BookSectionsContainer = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authors, setAuthors] = useState([]); 

    useEffect(() => {
    const fetchSectionsData = async () => {
    setLoading(true);
    setError(null);
    try {
    const apiUrl = import.meta.env.VITE_APP_API_URL;
    if (!apiUrl) {
    throw new Error("VITE_APP_API_URL no está definida. Revisa tu archivo .env");
    }

    //obtener libros de la api
  const booksResponse = await axios.get(`${apiUrl}/api/libros?limit=500`); // Por ejemplo, un límite de 500
 setBooks(booksResponse.data.books);


    //Obtener autores de la api
    const authorsResponse = await axios.get(`${apiUrl}/api/authors`);
   setAuthors(authorsResponse.data);

    setLoading(false);
    } catch (err) {
    setError(err.message || "Error al cargar los datos"); 
    setLoading(false);
    }
    };
    fetchSectionsData();
    }, []);

 if (loading) {
return <div className="loading-message">Cargando secciones de libros y autores...</div>;
}
if (error) { return <div className="error-message">Error al cargar secciones: {error.message}</div>;
}

const featuredBooks = books.filter(book => book.type === 'featured'); 
const bestSellingBooks = books.filter(book => book.type === 'best-selling');
const newArrivals = books.filter(book => book.type === 'new-arrivals');
const filteredAuthors = authors.filter(author => author.category === 'outstanding'); // Ejemplo: si tienes un 'type' en autores

  return (
    <>
      {/* Sección de Libros Destacados */}
      {featuredBooks.length > 0 && (
        <>
          <SectionHeader icon="+D" title="LIBROS DESTACADOS" />
          <BookList books={featuredBooks}/>
        </>
      )}

      {/* Sección de "Lo más vendido" */}
      {bestSellingBooks.length > 0 && (
        <>
          <SectionHeader icon="+V" title="LO MÁS VENDIDO" />
          <BookList books={bestSellingBooks}/>
        </>
      )}

      {/* Sección de "Novedades" */}
      {newArrivals.length > 0 && (
        <>
          <SectionHeader icon="N" title="NOVEDADES" />
          <BookList books={newArrivals} />
        </>
      )}

       {filteredAuthors.length > 0 && (
        <>
          <SectionHeader icon="A" title="Autores destacados" />
          <AuthorList authors={filteredAuthors} />
        </>
      )}
     
    
    </>
  );
};

export default BookSectionsContainer;