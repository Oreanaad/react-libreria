// src/components/StarRating.jsx
import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa'; // Asegúrate de instalar react-icons: npm install react-icons

function StarRating({ rating, onRatingChange, readOnly = false, maxStars = 5 }) {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    stars.push(
      <span
        key={i}
        onClick={() => !readOnly && onRatingChange(i)}
        style={{
          cursor: readOnly ? 'default' : 'pointer',
          color: i <= rating ? 'gold' : 'gray',
          fontSize: '24px',
          marginRight: '2px', // Pequeño espacio entre estrellas
        }}
      >
        {i <= rating ? <FaStar /> : <FaRegStar />}
      </span>
    );
  }
  return <div style={{ display: 'inline-block' }}>{stars}</div>;
}

export default StarRating;