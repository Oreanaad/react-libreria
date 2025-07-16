export const renderStars = (rating) => {
    if (rating === null || rating === undefined) {
      return null;
    }

    const roundedRating = Math.round(rating * 2) / 2; // Redondear a la media estrella más cercana (0, 0.5, 1, 1.5, etc.)
    const stars = [];

    // Creamos 5 spans para las estrellas. El CSS determinará si están llenas, medio llenas o vacías.
    for (let i = 1; i <= 5; i++) {
      let starClass = 'empty-star';
      if (i <= roundedRating) {
        starClass = 'full-star';
      } else if (i - 0.5 === roundedRating) {
        starClass = 'half-star';
      }
      stars.push(<span key={i} className={`star ${starClass}`}>★</span>); // Siempre usamos el caracter de estrella completa
    }

    return <div className="book-rating" data-rating={roundedRating}>{stars}</div>;
  };