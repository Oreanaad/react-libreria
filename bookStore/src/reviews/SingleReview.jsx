// src/components/ReseñaIndividual.jsx
import React from 'react';
import StarRating from './StarRating';
import './SingleReview.css'; // Importa el archivo CSS

function ReseñaIndividual({ review }) {
  const { username, comment, rating, createdAt } = review;

  const formattedDate = new Date(createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="review-card">
      <div className="review-header">
        <h4 className="reviewer-username">{username}</h4>
        <StarRating rating={rating} readOnly={true} />
      </div>
      <p className="review-comment">{comment}</p>
      <small className="review-date">Publicado el {formattedDate}</small>
    </div>
  );
}

export default ReseñaIndividual;