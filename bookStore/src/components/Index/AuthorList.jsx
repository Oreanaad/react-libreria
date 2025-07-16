import React from 'react';
import AuthorCard from './AuthorCard';
import './BookList.css';
import { Link } from 'react-router-dom';


const AuthorList = ({ authors }) => {
  if (!authors || authors.length === 0) {
    return <div className="no-books-message">No hay Autores disponibles en esta sección.</div>;
  }

  
  return (
    <>
    
    <div className="book-list-grid">
      {authors.map((author) => (
        <AuthorCard key={author.id} author={author} />
       
      ))}
    </div>
    </>
  );
};

export default AuthorList;