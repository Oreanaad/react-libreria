import React, { useState } from 'react';

import { useAuth } from '../../src/context/UseAuth'; // Asegúrate de que la ruta sea correcta
import Navegacion from "../../src/components/General/Navegacion";
import '../../src/components/LogIn/LogIn.css'; // Reutilizamos el CSS de login para consistencia

const ForgotPassword = () => {
    const { forgotPassword } = useAuth();
;

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        const result = await forgotPassword(email);
        setLoading(false);

        if (result.success) {
            setMessage(result.message);
            setEmail(''); // Limpiar el campo después del envío
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
                    <h2 className="login-title">Reinicia tu contraseña aquí</h2>
                </div>
                <div className="login-card">
                    <form onSubmit={handleSubmit} className="login-form">
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
                        
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar'}
                        </button>
                        
                        {message && <p className={`form-message ${message.includes('éxito') || message.includes('recibirás') ? 'success' : 'error'}`}>{message}</p>}
                    </form>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
