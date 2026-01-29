// src/components/ListaReseñas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import SingleReview from './SingleReview';
// No hay CSS propio aquí a menos que quieras estilos para 'Cargando reseñas...' o 'Error:'

function ListaReseñas({ bookId, refreshReviews }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/reviews/${bookId}`);
      if (!response.ok) {
        throw new Error('Error al cargar las reseñas. Código: ' + response.status);
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('No se pudieron cargar las reseñas. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchReviews();
  }, [bookId, fetchReviews, refreshReviews]);

  if (loading) return <p className="loading-message">Cargando reseñas...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (reviews.length === 0) return <p className="no-reviews-message">Aún no hay reseñas para este libro. ¡Sé el primero en escribir una!</p>;

  return (
    <div className="reviews-list-container">
      {reviews.map((review) => (
        <SingleReview key={review.id} review={review} />
      ))}
    </div>
  );
}

export default ListaReseñas;