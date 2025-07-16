// src/pages/ConfirmEmailPage.jsx
import React, { useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navegacion from '../../src/components/General/Navegacion'; // Asegúrate de que la ruta sea correcta
import '../../src/components/LogIn/LogIn.css'; // Reutilizamos el CSS de login para la apariencia de página

const ConfirmEmailPage = () => {
    const location = useLocation(); // Hook para acceder a la URL
    const navigate = useNavigate(); // Hook para navegación programática

    const [message, setMessage] = useState('Confirmando tu correo electrónico...');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasConfirmed, setHasConfirmed] = useState(false); // Nuevo estado para controlar si ya se confirmó exitosamente

    const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

    useEffect(() => {
        // Si ya se confirmó exitosamente, no intentes confirmar de nuevo
        if (hasConfirmed) {
            setLoading(false); // Asegúrate de que el estado de carga se desactive
            return;
        }

        const confirmEmail = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token'); // Obtiene el token de la URL

            if (!token) {
                setMessage('Token de confirmación no encontrado.');
                setIsSuccess(false);
                setLoading(false);
                return;
            }

            const apiUrl = `${API_BASE_URL}/api/auth/confirmarEmail/${token}`;
            console.log("URL de la API de confirmación de email que se está llamando:", apiUrl); // Para depuración

            try {
                const response = await fetch(apiUrl);
                const text = await response.text(); 

                if (response.ok) {
                    setMessage('¡Tu correo electrónico ha sido confirmado con éxito! Ya puedes iniciar sesión.');
                    setIsSuccess(true);
                    setHasConfirmed(true); // Marca como confirmado exitosamente
                    // Redirige al usuario al login después de 3 segundos
                    setTimeout(() => {
                        navigate('/login'); 
                    }, 3000); 
                } else {
                    setMessage(text || 'Error al confirmar el correo electrónico. El token puede ser inválido o haber expirado.');
                    setIsSuccess(false);
                    setHasConfirmed(false); // Asegura que no se marque como confirmado si hubo error
                }
            } catch (error) {
                console.error('Error en la confirmación de email:', error);
                setMessage('Error de conexión al intentar confirmar el correo electrónico.');
                setIsSuccess(false);
                setHasConfirmed(false);
            } finally {
                setLoading(false);
            }
        };

        confirmEmail();
    }, [location.search, API_BASE_URL, hasConfirmed, navigate]); // Añade hasConfirmed y navigate a las dependencias

    return (
        <>
            <Navegacion />
            <div className="login-page-container">
                <div className='login-header-content'>
                    <h1 className="login-title-Big">Confirmación de Correo</h1>
                    <h2 className="login-title">Estado de tu cuenta</h2>
                </div>
                <div className="login-card">
                    {loading && !hasConfirmed ? ( // Muestra "Cargando..." solo si está cargando y no se ha confirmado aún
                        <p className="form-message">Cargando...</p>
                    ) : (
                        // Muestra el mensaje de éxito si hasConfirmed es true, de lo contrario el mensaje actual
                        <div className={`form-message ${isSuccess ? 'success' : 'error'}`}>
                            <div dangerouslySetInnerHTML={{ __html: message }} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ConfirmEmailPage;
