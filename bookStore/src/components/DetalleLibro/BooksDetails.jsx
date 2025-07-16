import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { renderStars } from '../../hooks/RenderStars'; // Si usas esto para la puntuación
import './BooksDetails.css'
import Navegacion from '..//General/Navegacion'; 
import { useWishlist } from '../../context/WishListBook';
import { useCart } from '../../context/CartContext';
import axios from 'axios'; 
import toast from 'react-hot-toast';
import EscribirReseña from '../../reviews/writeReview';
import ListaReseñas from '../../reviews/ReviewList';
import { useAuth } from '../../context/UseAuth';

const BookDetailPage = () => {
  const { id } = useParams(); 
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { wishlist, toggleWishlistItem } = useWishlist(); 
  const {cart, addToCart} = useCart()
  const [isInWishlistState, setIsInWishlistState] = useState(false); 
  const [, setIsInCartState] = useState(false); 
  const{isAuthenticated} = useAuth(); 
 const [refreshReviewsFlag, setRefreshReviewsFlag] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true); 
      setError(null); 
      try {
        const apiUrl = import.meta.env.VITE_APP_API_URL;
        console.log("BookDetailPage: API URL base:", apiUrl); // Para depurar
        console.log("BookDetailPage: ID del libro:", id); 
        
        if (!apiUrl) {
            throw new Error("VITE_APP_API_URL no está definida. Revisa tu archivo .env");
        }

        // Usar axios para la petición
        const response = await axios.get(`${apiUrl}/api/libros/${id}`); // <--- ¡Usar axios.get!
        
        setBook(response.data);
   
      } catch (err) {
        console.error("BookDetailPage: Error al cargar los detalles del libro desde la API:", err);
        // Si el error es de axios.response, podemos obtener más detalles
        const errorMessage = err.response?.data?.error || err.message;
        setError(new Error(`No se pudo cargar el libro: ${errorMessage}`));
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]); // Asegúrate de que 'wishlist' es una dependencia para que se reevalúe isInWishlistState cuando cambie la wishlist

  // Efecto adicional para actualizar isInWishlistState cuando wishlist o book cambian
  useEffect(() => {
    if (book && wishlist) {
      setIsInWishlistState(wishlist.some(item => item.id === book.id));
    }
  }, [wishlist, book]); // Depende de wishlist y book

  useEffect(() => {
    if (book && cart) {
      setIsInCartState(cart.some(item => item.id === book.id));
    }
  }, [cart, book]); // Depende de wishlist y book

const handleReviewSubmitted = () => {
    setRefreshReviewsFlag(prev => !prev); // Altera el flag para disparar la recarga en ListaReseñas
  };

  if (loading) {
    return <div className="book-detail-message">Cargando detalles del libro...</div>;
  }

  if (error) {
    return <div className="book-detail-message error">{error.message}</div>;
  }

  if (!book) {
    return <div className="book-detail-message">El libro solicitado no está disponible.</div>;
  }
  const handleAddToCart = () => {
            console.log("BookDetailPage: Llamando addToCart con:", book)
      addToCart(book)

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

      const handleToggleWishlist = () => {
      console.log("BookDetailPage: Llamando toggleWishlistItem con:", book); 
      toggleWishlistItem(book);

            const message = isInWishlistState 
              ? `"${book.title}" ha sido eliminado de la lista de deseos.`
              : `"${book.title}" ha sido agregado a la lista de deseos!`;

      toast.success(message, {
            position: "bottom-center",
        style:{
    border: '1px solid #713200',
    padding: '16px',
    color: '#713200',
      position: "bottom-center"
    
      },
  iconTheme: {
    primary: '#713200',
    secondary: '#FFFAEE',
  },

      });
      };


  
  return (
    <>
      <Navegacion />
      <div className="book-detail-page-wrapper"> {/* Contenedor principal de la página */}
        <div className="book-detail-main-content"> {/* Contenedor principal para libro y reseñas */}
          
          {/* Información del libro (izquierda) */}
          <div className="book-info-card"> {/* Contenedor para el "card" del libro */}
            <div className="book-detail-content"> {/* Este es el que contiene imagen e info */}
              <div className="book-image-and-meta">
                <div className="book-detail-image-wrapper">
                  {book.imageUrl && (
                    <img
                      src={`/img/libros/${book.imageUrl}`}
                      alt={book.title}
                      className="book-main-image-circular"
                    />
                  )}
                </div>
                <p className="book-detail-author">Por: {book.author}</p>
                {book.rating && (
                  <div className="book-detail-rating">
                    {renderStars(book.rating)}
                    <span className="book-detail-reviews"></span>
                  </div>
                )}
              </div>

              <div className="book-detail-info">
                <h1 className="book-detail-title">{book.title}</h1>
                <div>
                  <h2>Descripción</h2>
                  <p>{book.description || 'No hay descripción disponible para este libro.'}</p>
                </div>
                {book.year && <p className="book-detail-meta"><strong>Año de Publicación:</strong> {book.year}</p>}

              <div className='price-block'>
    <p className="book-detail-price">€{book.price}</p>
    {book.oldPrice && book.discountPercentage > 0 ? (
        <div className="old-price-and-discount-wrapper"> {/* <-- Puedes añadir una clase aquí si quieres más control */}
            <p className="book-detail-old-price">
                Precio anterior: <span style={{ textDecoration: 'line-through' }}>€{book.oldPrice}</span>
            </p>
            <p className="book-detail-discount">
                ¡{book.discountPercentage}% de descuento!
            </p>
        </div>
    ) : (
        null
    )}

                  <div className="book-actions-group">
                    <button onClick={handleAddToCart} className="button add-to-cart-detail-button">
                      Añadir al Carrito
                    </button>
                    <button
                      onClick={handleToggleWishlist}
                      className={`wishlist-button ${isInWishlistState ? 'added' : ''}`}>
                      <span className="heart-icon">{isInWishlistState ? '❤️' : '🤍'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="book-detail-description author-section-container"> 
                <h2>Sobre el autor</h2>
                <p className="book-detail-author-name">{book.author}</p>
                <p>{book.authorDescription || 'No hay descripción disponible para este autor.'}</p>
                {book.authorImage && (
                  <img 
                    src={`/img/autores/${book.authorImage}`} 
                    alt={`Foto de ${book.author}`}
                    className="author-image-circle"
                  />
                )}
              </div>
            {/* --- FIN SECCIÓN SOBRE EL AUTOR --- */}
          </div>
          
          {/* Sección de reseñas (derecha) */}
          <div className="reviews-card"> {/* Contenedor para la sección de reseñas */}
            <h2 className="reviews-section-title">Reseñas de Usuarios</h2>

            {isAuthenticated ? (
              <EscribirReseña bookId={book.id} onReviewSubmitted={handleReviewSubmitted} />
            ) : (
              <p className="login-prompt-message">
                Inicia sesión para escribir una reseña.
              </p>
            )}

            <ListaReseñas bookId={book.id} refreshReviews={refreshReviewsFlag} />
          </div>

        </div> {/* Fin book-detail-main-content */}

      </div> {/* Fin book-detail-page-wrapper */}
    </>
  );
}
export default BookDetailPage;