// src/components/WishlistDisplay.jsx
import React from 'react';
import { useWishlist } from '../../context/WishListBook'; // Asegúrate de que la ruta sea correcta
import { Link } from 'react-router-dom'; // Si quieres que los botones de "Ver lista" naveguen
import './WishListSideBar.css'; // Asegúrate de importar este CSS

const WishlistDisplay = ({ onClose }) => {
    const { wishlist, toggleWishlistItem } = useWishlist();

    

    return (
        <div className="wishlist-overlay"> {/* Overlay oscuro de fondo */}
            <div className="wishlist-sidebar-content"> {/* El panel lateral/modal */}
                <div className="sidebar-header">
                    <h2>LISTA DE DESEOS</h2>
                    {/* Botón "X" para cerrar el panel (similar al carrito) */}
                    <button className="close-sidebar-button" onClick={onClose}>&times;</button>
                </div>

                {wishlist.length === 0 ? (
                    <p className="empty-wishlist-message">Tu lista de deseos está vacía.</p>
                ) : (
                    <>
                      <div className="wishlist-items-container">
                            {wishlist.map(product => (
                                <div key={product.id} className="wishlist-item">
                                    <div className="item-image-wrapper">
                                      
                                        <img
                                            src={`/img/libros/${product.imageUrl} ` }
                                            alt={product.title || 'Libro en lista de deseos'}
                                            className="item-image"
                                        />
                                    </div>
                                    <div className="item-details">
                                      
                                        <h3>{product.title || 'Título Desconocido'}</h3>
                                      
                                        <p>1 • €{typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}</p>
                                    </div>
                                    
                                    <button className="remove-item-button" onClick={() => toggleWishlistItem(product)}>
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>

               

                    </>
                )}
            </div>
        </div>
    );
};

export default WishlistDisplay;