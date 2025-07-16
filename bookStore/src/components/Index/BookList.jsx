import React from 'react';
import BookCard from './BookCard';
import './BookList.css';
import { Link } from 'react-router-dom';
const BookList = ({ books }) => {
  if (!books || books.length === 0) {
    return <div className="no-books-message">No hay libros disponibles en esta sección.</div>;
  }

  
  return (
    <>
    
    <div className="book-list-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
       
      ))}
    </div>
    </>
  );
};

export default BookList;