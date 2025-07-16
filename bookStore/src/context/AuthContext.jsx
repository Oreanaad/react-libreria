// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';

// 1. Crea el contexto de autenticación
export const AuthContext = createContext(null);

// 2. Crea el proveedor de autenticación
export const AuthProvider = ({ children }) => {
  // Estado para almacenar la información del usuario y el token
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // 
  const [loading, setLoading] = useState(true); // Para saber si la carga inicial de datos de auth ha terminado

  // URL base de tu API (desde las variables de entorno de Vite)
  const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

    useEffect(() => {
        const loadUserFromStorage = () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(parsedUser);
                    setIsAuthenticated(true); // <--- ¡Actualiza el estado de autenticación!
                    console.log("[AuthContext] Usuario y token cargados de localStorage.");
                } else {
                    // Si no hay token o user, asegúrate de que no esté autenticado
                    setIsAuthenticated(false);
                    console.log("[AuthContext] No hay usuario o token en localStorage.");
                }
            } catch (error) {
                console.error("Error al cargar datos de usuario desde localStorage:", error);
                // Si hay un error, limpia cualquier dato corrupto
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
                setIsAuthenticated(false); // <--- Asegura el estado de no autenticado
            } finally {
                setLoading(false); // La carga inicial ha terminado, independientemente del resultado
                console.log("[AuthContext] Carga inicial de autenticación terminada.");
            }
        };
        loadUserFromStorage();
    }, []); // Se ejecuta solo una vez al montar


    const register = useCallback(async (username, email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Error en el registro'); }
            return { success: true, message: data.message };
        } catch (error) {
            console.error('Error al registrar:', error);
            return { success: false, message: error.message || 'Error desconocido al registrar.' };
        }
    }, [API_BASE_URL]);

    const login = useCallback(async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Error en el inicio de sesión'); }

            setToken(data.token);
            setUser(data.user);
            setIsAuthenticated(true); // <--- ¡Actualiza el estado de autenticación!
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log("[AuthContext] Inicio de sesión exitoso.");

            return { success: true, message: data.message };
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setToken(null);
            setUser(null);
            setIsAuthenticated(false); // <--- Asegura el estado de no autenticado si falla el login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return { success: false, message: error.message || 'Error desconocido al iniciar sesión.' };
        }
    }, [API_BASE_URL]);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false); // <--- ¡Actualiza el estado de autenticación!
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('Sesión cerrada.');
    }, []);

    const forgotPassword = useCallback(async (email) => {
        // ... tu lógica de forgotPassword, envuelta en useCallback
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Error al solicitar restablecimiento.'); }
            return { success: true, message: data.message };
        } catch (error) {
            console.error('Error en forgotPassword:', error);
            return { success: false, message: error.message || 'Error desconocido al solicitar restablecimiento.' };
        }
    }, [API_BASE_URL]);

    const resetPassword = useCallback(async (token, newPassword) => {
        // ... tu lógica de resetPassword, envuelta en useCallback
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Error al restablecer contraseña.'); }
            return { success: true, message: data.message };
        } catch (error) {
            console.error('Error en resetPassword:', error);
            return { success: false, message: error.message || 'Error desconocido al restablecer contraseña.' };
        }
    }, [API_BASE_URL]);


    // Función para obtener el token actual (tal como la tenías)
    const getTokenValue = useCallback(() => { // Renombrada para evitar conflicto con prop 'token' y envuelta en useCallback
      return token;
    }, [token]);


    // El valor que se proporcionará a los componentes que consuman el contexto
    const authContextValue = {
        user,
        token,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        getToken: getTokenValue, // <--- ¡Asegúrate de exportar la función con un nombre claro!
    };

    // Renderiza los componentes hijos, proporcionándoles el valor del contexto
    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

