// src/components/EscribirReseña.jsx
import React, { useState } from 'react';
import StarRating from './StarRating';
import './WriteReview.css'; // Importa el archivo CSS

function EscribirReseña({ bookId, onReviewSubmitted }) {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const getUserToken = () => {
    return localStorage.getItem('token');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!reviewText.trim() || rating === 0) {
      setError('Por favor, escribe tu reseña y selecciona una valoración.');
      return;
    }

    const userToken = getUserToken();
    console.log("EscribirReseña: Token obtenido de localStorage:", userToken); // <-- ESTA LÍNEA

    if (!userToken) {
      setError('Debes iniciar sesión para enviar una reseña.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          bookId: bookId,
          rating: rating,
          comment: reviewText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la reseña.');
      }

      setSuccess(true);
      setReviewText('');
      setRating(0);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Hubo un error al enviar tu reseña.');
    } finally {
      setSubmitting(false);
    }}

  return (
    <div className="write-review-card">
      <h3 className="write-review-title">Escribe tu reseña</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Tu valoración:</label>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>
        <div className="form-group">
          <label className="form-label">Tu reseña:</label>
          <textarea
            placeholder="¿Qué te pareció este libro?"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows="5"
            className="review-textarea"
            disabled={submitting}
          ></textarea>
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">¡Reseña enviada con éxito!</p>}
        <button
          type="submit"
          disabled={submitting}
          className="submit-review-button"
        >
          {submitting ? 'Enviando...' : 'Enviar Reseña'}
        </button>
      </form>
    </div>
  );
}

export default EscribirReseña;