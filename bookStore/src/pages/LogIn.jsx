// src/components/LogIn/LogInForm.jsx (o el nombre de tu archivo)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/UseAuth'; // Asegúrate de que la ruta sea correcta
import Navegacion from '../../src/components/General/Navegacion'; // Mantienes tu componente de navegación
import '../components/LogIn/LogIn.css'; // Tu archivo de estilos para este componente

const LogInForm = () => {
    const { login } = useAuth(); // Obtiene la función de login del contexto
    const navigate = useNavigate(); // Hook para navegación programática

    const [email, setEmail] = useState(''); // Usamos email como 'username' para el login
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // Para mensajes de éxito/error
    const [loading, setLoading] = useState(false); // Estado de carga

    const handleSubmit = async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario
        setMessage(''); // Limpiar mensajes anteriores
        setLoading(true);

        // Llama a la función de login del contexto de autenticación
        // Usamos 'email' como 'username' para el backend si es lo que espera tu API
        const result = await login(email, password); 
        setLoading(false);

        if (result.success) {
            setMessage(result.message);
            // Redirigir al usuario a la página principal o a su perfil
            navigate('/'); 
        } else {
            setMessage(result.message);
        }
    };

    return (
        <>
            <Navegacion /> {/* Tu componente de navegación */}
            <div className="login-page-container"> {/* Contenedor principal de la página */}
                
                <div className='login-header-content'>
                    <h1 className="login-title-Big">Querido Lector</h1>
                    <h2 className="login-title">Inicia sesión aquí</h2>
                </div>

                <div className="login-card"> {/* La "tarjeta" del formulario */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group"> {/* Grupo para Email */}
                            <label htmlFor="email">Email</label>
                            <input
                                type='email' // Cambiado a 'email' para validación de navegador
                                id="email"
                                placeholder='Tu email'
                                className='form-input' // Clase genérica para inputs
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group"> {/* Grupo para Contraseña */}
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type='password'
                                id="password"
                                placeholder='Tu contraseña'
                                className='form-input' // Clase genérica para inputs
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                        
                        {/* Mensajes de éxito/error */}
                        {message && <p className={`form-message ${message.includes('éxito') ? 'success' : 'error'}`}>{message}</p>}

                        <div className="form-links"> {/* Contenedor para los enlaces */}
                            <p>
                                <span onClick={() => navigate('/registrar')} className="link-text">
                                    ¿No tienes una cuenta? Regístrate
                                </span>
                            </p>
                            <p>
                                <span onClick={() => navigate("/resetPassword")} className="link-text">
                                    ¿Olvidaste tu contraseña?
                                </span>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default LogInForm;
