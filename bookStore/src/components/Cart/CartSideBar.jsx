import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import './CartSideBar.css'; // Asegúrate de que los estilos CSS estén bien aplicados
import FinalizarCompra from '../../pages/FinalizarCompra'

const CartDisplay = ({ onClose }) => {
    // Extraemos las propiedades y funciones directamente del contexto
    // Incluimos updateItemQuantity y removeItemFromCart que necesitaremos aquí
    const { cart, cartCount, cartTotalPrice, updateItemQuantity, removeItemFromCart, clearCart } = useCart();

    // --- Funciones de manejo de cantidad y eliminación para cada ítem ---
    // (Estas funciones ahora están definidas DENTRO de este componente)

    const handleIncreaseQuantity = (itemId, currentQuantity) => {
        updateItemQuantity(itemId, currentQuantity + 1);
    };

    const handleDecreaseQuantity = (itemId, currentQuantity) => {
        // Si la cantidad es 1 y se intenta decrementar, elimina el ítem del carrito.
        // De lo contrario, simplemente decrementa la cantidad.
        if (currentQuantity > 1) {
            updateItemQuantity(itemId, currentQuantity - 1);
        } else {
            removeItemFromCart(itemId);
        }
    };

    const handleRemoveItem = (itemId) => {
        removeItemFromCart(itemId);
    };

    return (
        <div className="cart-overlay"> {/* Overlay oscuro de fondo */}
            <div className="cart-sidebar-content"> {/* El panel lateral/modal */}
                <div className="sidebar-header">
                    <h2>Carrito de compras ({cartCount} {cartCount === 1 ? 'ítem' : 'ítems'})</h2>
                    <button className="close-sidebar-button" onClick={onClose}>&times;</button>
                </div>

                {cart.length === 0 ? (
                    <p className="empty-cart-message">Tu carrito está vacío.</p>
                ) : (
                    <>
                        <div className="cart-items-container">
                            {/* Ahora mapeamos los productos y mostramos su detalle y controles aquí mismo */}
                            {cart.map(product => (
                                <div key={product.id} className="cart-item"> {/* Clase para cada ítem */}
                                    <div className="item-image-wrapper">
                                        <img
                                            src={`/img/libros/${product.imageUrl} ` }
                                            alt={product.title || 'Libro en carrito'}
                                            className="item-image"
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h3>{product.title || 'Título Desconocido'}</h3>
                                        <p className="item-price-quantity">
                                            {/* Muestra la cantidad y el precio unitario */}
                                            {product.quantity} • €{typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                                        </p>
                                        <p className="item-subtotal">
                                            {/* Calcula y muestra el subtotal por ítem */}
                                            Subtotal: €{(product.price * product.quantity).toFixed(2)}
                                        </p>

                                        {/* --- Controles de Cantidad y Botón de Eliminar --- */}
                                        <div className="cart-item-quantity-control">
                                            <button
                                                onClick={() => handleDecreaseQuantity(product.id, product.quantity)}
                                                className="quantity-btn"
                                            >
                                        -
                                            </button>
                                            <span className="quantity-display">{product.quantity}</span>
                                            <button
                                                onClick={() => handleIncreaseQuantity(product.id, product.quantity)}
                                                className="quantity-btn"
                                            >
                                           +
                                            </button>
                                            <button
                                                onClick={() => handleRemoveItem(product.id)}
                                                className="remove-item-button"
                                            >
                                                    X
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Contenedor para el total y los botones de acción */}
                        <div className="cart-summary">
                            <p className="cart-total">Total: €{cartTotalPrice.toFixed(2)}</p>

                            {/* Botón para vaciar todo el carrito */}
                            <button
                                className="clear-cart-button"
                                onClick={() => {
                                    if (window.confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
                                        clearCart();
                                    }
                                }}
                            >
                                Vaciar Carrito
                            </button>

                            <Link
                                to="/finalizarCompra" // Ruta a tu página de checkout
                                className="checkout-button"
                                onClick={onClose} // Cierra el sidebar al hacer click en "Finalizar Compra"
                            >
                                Finalizar Compra
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartDisplay;