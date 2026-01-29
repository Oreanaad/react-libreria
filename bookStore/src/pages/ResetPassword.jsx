import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/UseAuth'; 
import Navegacion from "../../src/components/General/Navegacion";
import '../../src/components/LogIn/LogIn.css';

const ResettPassword = () => {
    const { resetPassword } = useAuth();
    const { token } = useParams(); // Captura el token de la URL
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            return setMessage("Las contraseñas no coinciden");
        }

        setMessage('');
        setLoading(true);

        const result = await resetPassword(token, newPassword);
        setLoading(false);

        if (result.success) {
            setMessage("Contraseña actualizada con éxito. Redirigiendo al login...");
            setTimeout(() => {
                navigate('/login'); // Redirige tras 3 segundos
            }, 3000);
        } else {
            setMessage(result.message);
        }
    };

    return (
        <>
            <Navegacion />
            <div className="login-page-container">
                <div className='login-header-content'>
                    <h1 className="login-title-Big">Nueva Etapa</h1>
                    <h2 className="login-title">Crea tu nueva contraseña</h2>
                </div>
                <div className="login-card">
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="password">Nueva Contraseña</label>
                            <input
                                type='password'
                                id="password"
                                placeholder='Mínimo 6 caracteres'
                                className='form-input'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <input
                                type='password'
                                id="confirmPassword"
                                placeholder='Repite tu contraseña'
                                className='form-input'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Guardando...' : 'Actualizar Contraseña'}
                        </button>
                        
                        {message && (
                            <p className={`form-message ${message.includes('éxito') ? 'success' : 'error'}`}>
                                {message}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
};

export default ResettPassword;