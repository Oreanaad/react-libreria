// src/pages/OrderConfirmationPage/OrderConfirmationPage.jsx (o donde tengas tu página de confirmación)
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Para obtener el estado de la navegación


const OrderConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, whatsappLink } = location.state || {}; // Desestructura los datos pasados desde CheckoutPage

    useEffect(() => {
        // Si no hay orderId o whatsappLink, redirige a la página principal
        if (!orderId) {
            navigate('/');
            return;
        }

        // Abre WhatsApp automáticamente si el enlace existe
        if (whatsappLink) {
            window.open(whatsappLink, '_blank'); // Abre el enlace en una nueva pestaña/ventana
        }
    }, [orderId, whatsappLink, navigate]);

    return (
        <>
         
        <div className="order-confirmation-container">
            <h2 className="order-confirmation-title">¡Pedido Realizado con Éxito!</h2>
            <p>Gracias por tu compra.</p>
            <p>Tu número de pedido es: <strong>#{orderId}</strong></p>
            <p>Te hemos enviado un correo electrónico de confirmación a tu dirección de email.</p>

            {/* Opcional: Mostrar un botón de WhatsApp por si la apertura automática falla o el usuario cierra la pestaña */}
            {whatsappLink && (
                <div style={{ marginTop: '30px' }}>
                    <p>Si WhatsApp no se abrió automáticamente, puedes usar este botón:</p>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            padding: '12px 25px',
                            backgroundColor: '#25D366',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '1.1em',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        <i className="fab fa-whatsapp" style={{ marginRight: '10px' }}></i>
                        Abrir WhatsApp y Confirmar Pedido
                    </a>
                </div>
            )}

            <button onClick={() => navigate('/')} className="back-to-home-btn" style={{ marginTop: '40px', padding: '10px 20px', fontSize: '1em' }}>
                Volver a la tienda
            </button>
        </div>
        </>
    );
 
};

export default OrderConfirmationPage;