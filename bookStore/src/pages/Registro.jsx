import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../src/context/UseAuth'; // Asegúrate de que la ruta sea correcta
import Navegacion from "../../src/components/General/Navegacion";
import '../../src/components/LogIn/LogIn.css'; // Reutilizamos el CSS de login para consistencia
const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        if (password !== confirmPassword) {
            setMessage('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        const result = await register(username, email, password);
        setLoading(false);

        if (result.success) {
            setMessage(result.message);
            // Opcional: limpiar el formulario después de un registro exitoso
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } else {
            setMessage(result.message);
        }
    };

    return (
        <>
            <Navegacion />
            <div className="login-page-container">
                <div className='login-header-content'>
                    <h1 className="login-title-Big">Querido Lector</h1>
                    <h2 className="login-title">Regístrate aquí</h2>
                </div>
                <div className="login-card">
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Nombre de Usuario</label>
                            <input
                                type='text'
                                id="username"
                                placeholder='Tu nombre de usuario'
                                className='form-input'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type='email'
                                id="email"
                                placeholder='Tu email'
                                className='form-input'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type='password'
                                id="password"
                                placeholder='Tu contraseña'
                                className='form-input'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar contraseña</label>
                            <input
                                type='password'
                                id="confirmPassword"
                                placeholder='Confirma tu contraseña'
                                className='form-input'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrar'}
                        </button>
                    
                        {message && <p className={`form-message ${message.includes('éxito') ? 'success' : 'error'}`}>{message}</p>}

                        <div className="form-links">
                            <p>
                                <span onClick={() => navigate("/login")} className="link-text">
                                    ¿Ya tienes una cuenta? Inicia Sesión
                                </span>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Register;
