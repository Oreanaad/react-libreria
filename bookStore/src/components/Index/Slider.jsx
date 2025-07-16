import React, { useState, useEffect, useCallback, useRef } from 'react'; // Añadido useCallback y useRef
import './Slider.css'; 
import { Link } from 'react-router-dom'; // Link está importado pero no se usa en este código, lo mantengo por contexto.

const Slider = ({ images, autoPlay = true, autoPlayDelay = 6000 }) => { // Añadimos props para controlar el autoplay
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const intervalRef = useRef(null); // Usamos useRef para almacenar el ID del intervalo del temporizador

  // Función para avanzar a la siguiente imagen (se encarga del bucle)
  // Usamos useCallback para que esta función sea "estable" y no se recree innecesariamente
  const goToNext = useCallback(() => {
    setCurrentImgIndex((prevIndex) => 
      (prevIndex === images.length - 1) ? 0 : prevIndex + 1
    );
  }, [images.length]); // Esta función solo depende de images.length

  // Función para ir a la imagen anterior (se encarga del bucle)
  const goToPrevious = useCallback(() => {
    setCurrentImgIndex((prevIndex) =>
      (prevIndex === 0) ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]); // Esta función solo depende de images.length

  // --- Función para reiniciar el temporizador del autoplay ---
  // Se llama al inicio, y cada vez que el usuario interactúa
  const resetAutoPlayTimer = useCallback(() => {
    // 1. Limpiar cualquier temporizador existente para evitar múltiples intervalos
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // 2. Si el autoplay está activado y hay más de una imagen, iniciar un nuevo temporizador
    if (autoPlay && images.length > 1) {
      intervalRef.current = setInterval(() => {
        goToNext(); // Llama a la función para pasar a la siguiente imagen
      }, autoPlayDelay);
    }
  }, [autoPlay, autoPlayDelay, images.length, goToNext]); // Dependencias: Si alguna cambia, la función se actualiza

  // --- useEffect para manejar el Autoplay ---
  useEffect(() => {
    resetAutoPlayTimer(); // Inicia el temporizador cuando el componente se monta

    // Función de limpieza: se ejecuta cuando el componente se desmonta
    // o antes de que el useEffect se re-ejecute (si sus dependencias cambian)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Limpia el intervalo para evitar fugas de memoria
      }
    };
  }, [resetAutoPlayTimer]); // Este useEffect se re-ejecutará cuando resetAutoPlayTimer cambie (que es poco frecuente)

  // --- Handlers para las interacciones del usuario ---
  // Al hacer clic en una flecha o un punto, cambiamos la imagen Y reiniciamos el temporizador
  const handleGoToPrevious = () => {
    goToPrevious();
    resetAutoPlayTimer(); // Reiniciar el temporizador después de la interacción del usuario
  };

  const handleGoToNext = () => {
    goToNext();
    resetAutoPlayTimer(); // Reiniciar el temporizador después de la interacción del usuario
  };

  const handleDotClick = (index) => {
    setCurrentImgIndex(index);
    resetAutoPlayTimer(); // Reiniciar el temporizador después de la interacción del usuario
  };

  return(
    <div className="slider-container">
      <div className="slider-image-wrapper">
        <img
          src={images[currentImgIndex]}
          alt={`Slider image ${currentImgIndex + 1}`}
          className="slider-image"
        />
      </div>
      <div className="slider-navigation">
        <button onClick={handleGoToPrevious} className="slider-arrow left-arrow">
          &lt;
        </button>
        <button onClick={handleGoToNext} className="slider-arrow right-arrow">
          &gt;
        </button>
      </div>
      {/* Opcional: Puntos indicadores */}
      <div className="slider-dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${currentImgIndex === index ? 'active' : ''}`}
            onClick={() => handleDotClick(index)} // Usamos handleDotClick aquí
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Slider;