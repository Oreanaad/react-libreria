import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/UseAuth'; // Si el usuario puede estar logueado
import { useNavigate } from 'react-router-dom'; // Para redireccionar después de la compra
import axios from 'axios'; // Para hacer peticiones HTTP
import './CompraForm.css'; // Estilos específicos para el checkout


const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

const venezuelanStates = [
    "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo",
    "Cojedes", "Delta Amacuro", "Dependencias Federales", "Distrito Capital",
    "Falcón", "Guárico", "La Guaira", "Lara", "Mérida", "Miranda", "Monagas",
    "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo", "Yaracuy",
    "Zulia"
].sort();

const CheckoutPage = () => {
    const { cart, cartTotalPrice, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        gender: user?.gender || '',
        country: 'Venezuela', // Preseleccionado y fijo
        address: user?.address || '',
        apartment: user?.apartment || '',
        state: user?.state || '',
        phone: user?.phone || '', // Importante para WhatsApp
        email: user?.email || '', // Importante para el email
        createAccount: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // No necesitamos un estado específico para whatsappLink aquí si lo pasamos directamente
    // al navigate, pero lo mantenemos para claridad si decides mostrarlo en esta misma página
    const [whatsappLink, setWhatsappLink] = useState('');

    useEffect(() => {
        if (cart.length === 0 && !orderSuccess) {
            navigate('/');
        }
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                country: 'Venezuela',
                address: user.address || '',
                apartment: user.apartment || '',
                state: user.state || '',
                phone: user.phone || '',
                email: user.email || '',
            }));
        }
    }, [cart, orderSuccess, isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Preparamos los datos del cliente primero
    const customerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        apartment: formData.apartment,
        state: formData.state,
        country: formData.country,
        birthDate: formData.birthDate,
        gender: formData.gender,
        userId: isAuthenticated ? user.id : null // Opcional: Vincular cliente al usuario
    };

    try {
        // 2. CREAR EL CLIENTE PRIMERO (en OrdersCustomersInfo)
        // Debes tener una ruta en tu backend para esto, o manejarlo todo en la ruta de orders
        const customerResponse = await axios.post(`${API_BASE_URL}/api/customers`, customerData);
        const newCustomerId = customerResponse.data.id; // Obtenemos el ID real de la tabla OrdersCustomersInfo

        // 3. AHORA CREAMOS LA ORDEN CON EL ID CORRECTO
        const orderData = {
            totalPrice: cartTotalPrice,
            userId: isAuthenticated ? user.id : null,
            customerId: newCustomerId, // <--- USAMOS EL ID RECIÉN CREADO
            status: 'Pendiente',
            products: cart.map(item => ({
                productId: item.id,
                title: item.title,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        const dbResponse = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
        
        // ... resto de tu lógica de WhatsApp y navegación ...
        
    } catch (err) {
        console.error('Error al procesar la orden:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Error al procesar tu pedido.');
    } finally {
        setLoading(false);
    }
};
    // Esto se ejecutará si la compra fue exitosa y estamos en esta página
    // Nota: con la redirección, probablemente ya no se vea este estado en CheckoutPage,
    // pero es bueno tenerlo como fallback o si decides no redirigir inmediatamente.
    if (orderSuccess) {
        return (
            <div className="checkout-container">
                <h2 className="checkout-title">¡Pedido Realizado con Éxito!</h2>
                <p>Gracias por tu compra. Te hemos enviado un correo electrónico de confirmación.</p>
                {whatsappLink && (
                    <div style={{ marginTop: '20px' }}>
                        <p>También puedes **confirmar por WhatsApp**:</p>
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                backgroundColor: '#25D366',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '5px',
                                fontWeight: 'bold'
                            }}
                        >
                            Abrir WhatsApp y Enviar Confirmación
                        </a>
                    </div>
                )}
                <button onClick={() => navigate('/')} className="back-to-home-btn">Volver a la tienda</button>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="checkout-container">
                <h2 className="checkout-title">Tu carrito está vacío.</h2>
                <p>No hay productos para proceder con la compra.</p>
                <button onClick={() => navigate('/')} className="back-to-home-btn">Volver a la tienda</button>
            </div>
        );
    }

    // El resto de tu JSX del formulario permanece igual
    return (
        <div className="checkout-page">
            <h1 className="checkout-header">Finalizar Compra</h1>

            <form className="checkout-form" onSubmit={handleSubmit}>
                <section className="billing-details">
                    <h2>Detalles de facturación</h2>
                    <div className="form-group">
                        <label htmlFor="firstName">Nombre *</label>
                        <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Apellidos *</label>
                        <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="birthDate">Fecha de Nacimiento *</label>
                        <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Sexo *</label>
                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="">Seleccionar</option>
                            <option value="Hombre">Hombre</option>
                            <option value="Mujer">Mujer</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="country">País / Región *</label>
                        <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} required readOnly />
                    </div>
                    <div className="form-group">
                        <label htmlFor="state">Región / Provincia *</label>
                        <select id="state" name="state" value={formData.state} onChange={handleChange} required>
                            <option value="">Seleccionar estado</option>
                            {venezuelanStates.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Dirección de la calle *</label>
                        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Nombre de la calle y número de la casa" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="apartment">Apartamento habitación, etc. (opcional)</label>
                        <input type="text" id="apartment" name="apartment" value={formData.apartment} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Teléfono *</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Dirección de correo electrónica *</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group checkbox-group">
                        <input type="checkbox" id="createAccount" name="createAccount" checked={formData.createAccount} onChange={handleChange} />
                        <label htmlFor="createAccount">¿Crear una cuenta?</label>
                    </div>
                </section>

                <section className="order-summary">
                    <h2>Tu pedido</h2>
                    <div className="order-items-table">
                        <div className="table-header">
                            <span>Producto</span>
                            <span>Subtotal</span>
                        </div>
                        {cart.map(item => (
                            <div key={item.id} className="table-row">
                                <span>{item.title} • {item.quantity}</span>
                                <span>€{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="table-row total-row">
                            <span>Subtotal</span>
                            <span>€{cartTotalPrice.toFixed(2)}</span>
                        </div>
                        <div className="table-row total-row final-total">
                            <span>Total</span>
                            <span>€{cartTotalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="payment-method">
                        <h3>Por acordar</h3>
                        <p>El pago y el envío</p>
                        <p className="privacy-text">
                            Sus datos personales se utilizarán para procesar su pedido, respaldar su experiencia en este sitio web y para fines descritos en nuestra política de privacidad.
                        </p>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="place-order-button" disabled={loading}>
                        {loading ? 'Procesando...' : 'REALIZAR EL PEDIDO'}
                    </button>
                </section>
            </form>
        </div>
    );
};

export default CheckoutPage;