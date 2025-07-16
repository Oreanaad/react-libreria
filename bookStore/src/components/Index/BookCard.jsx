// src/components/BookCard.jsx
import React from 'react';
import './BookCard.css'; // Estilos específicos para la tarjeta de libro
import { renderStars } from '../../hooks/RenderStars'; // Importa la función para renderizar estrellas
import { Link } from 'react-router-dom'; // <--- ¡Asegúrate de que Link esté importado!
import BookDetailPage from '../DetalleLibro/BooksDetails';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast'; // Importa toast para notificaciones

const BookCard = ({ book }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    
    addToCart(book);

     toast.success(`"${book.title}" ha sido agregado al carrito!`, { 
           position: "bottom-center",
      style:{
    border: '1px solid #713200',
    padding: '16px',
    color: '#713200',
  
    
      },
  iconTheme: {
    primary: '#713200',
    secondary: '#FFFAEE',
  },


  

      });



  };


  return (
    <div className="book-card">
   
      <Link to={`/libros/${book.id}`} className="book-image-link"> {/* Puedes añadir una clase para estilos si necesitas */}
        <div className="book-image-container">
          <img 
          src={`/img/libros/${book.imageUrl}`} 
          alt={book.title} 
          className="book-image" />
        </div>
      </Link>

      <div className="book-info">
        {renderStars(book.rating)}
    
         <Link to={`/libros/${book.id}`} className="book-title-link"> 
            <h3 className="book-title">{book.title}</h3>
         </Link> 
        <p className="book-author">{book.author}</p>
        <p className="book-price-new">€{book.price}</p> {/* Formato de moneda */}
      </div>

      <div className="book-actions">
       
        <Link to={`/libros/${book.id}`} className="button details-button">
          Detalles
        </Link>
     
        <button onClick={handleAddToCart} className="button add-to-cart-button">
          
          <span className="icon"></span> Añadir
        </button>
      </div>
    </div>
  );
};

export default BookCard;