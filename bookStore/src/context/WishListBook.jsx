// src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/UseAuth';
import "../components/WishList/WishListBook.css"
import axios from 'axios'; // <-- CRÍTICO: ¡Importar axios aquí!


export const API_BASE_URL = import.meta.env.VITE_APP_API_URL;
//console.log("WishlistContext: API_BASE_URL cargada:", API_BASE_URL);

const WishlistContext = createContext();

export const useWishlist = () => {
    return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. **DEFINE updateWishlistInDB PRIMERO**
    const updateWishlistInDB = useCallback(async (currentWishlist) => {
      //  console.log("updateWishlistInDB: Se ha llamado.");
       // console.log("updateWishlistInDB: user =", user ? user.username : "null", "token =", token ? "Existe Token" : "No hay Token");

        if (!user || !token) {
           // console.warn("updateWishlistInDB: No hay usuario logueado o token. No se enviará la wishlist a la DB.");
            return;
        }

       // console.log("FRONTEND: Enviando wishlist a DB para usuario", user.id, ":", JSON.stringify(currentWishlist, null, 2));

        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/wishlist/sync`,
                currentWishlist,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
              //  console.log('FRONTEND: Wishlist actualizada correctamente en la DB (respuesta 200).');
                setError(null);
            } else {
               // console.error('FRONTEND: Error inesperado al actualizar la wishlist en la DB:', response.status, response.data);
                setError(response.data.message || 'Error al actualizar la wishlist en la DB.');
            }
        } catch (error) {
          //  console.error('FRONTEND: ERROR DE AXIOS (red o servidor):', error);
            if (error.response) {
               // console.error("Detalles del error de respuesta:", error.response.data);
               // console.error("Estado del error:", error.response.status);
                setError(error.response.data.message || 'Error del servidor al actualizar la wishlist.');
            } else if (error.request) {
              //  console.error("No se recibió respuesta del servidor:", error.request);
                setError('No se pudo conectar al servidor. Intente de nuevo más tarde.');
            } else {
                //console.error("Error al configurar la solicitud:", error.message);
                setError('Error desconocido al actualizar la wishlist.');
            }
        }
    }, [user, token, API_BASE_URL]);


    // 2. **DEFINE fetchUserWishlistFromDB DESPUÉS DE updateWishlistInDB (si updateWishlistInDB la usa) o ANTES DEL PRIMER useEffect**
    const fetchUserWishlistFromDB = useCallback(async () => {
        if (!user || !token) {
            setWishlist([]);
            setIsLoading(false);
           // console.log("fetchUserWishlistFromDB: No hay usuario o token. No se carga de la DB.");
            return;
        }

      //  console.log("fetchUserWishlistFromDB: Intentando cargar wishlist de DB para usuario:", user.id);
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                const fetchedWishlist = Array.isArray(response.data.wishlist) ? response.data.wishlist : [];

                setWishlist(fetchedWishlist);
            } else {
             //  console.error('fetchUserWishlistFromDB: Error al cargar la wishlist de la DB:', response.status, response.statusText);
                setError(response.data.message || 'Error al cargar la wishlist de la DB.');
                setWishlist([]);
            }
        } catch (error) {
           // console.error('fetchUserWishlistFromDB: Error de red al cargar la wishlist de la DB:', error);
            if (error.response) {
              // console.error("Detalles del error de respuesta:", error.response.data);
              // console.error("Estado del error:", error.response.status);
                setError(error.response.data.message || 'Error del servidor al cargar la wishlist.');
            } else {
                setError('Error de red o servidor no disponible al cargar la wishlist.');
            }
            setWishlist([]);
        } finally {
            setIsLoading(false);
        }
    }, [user, token, API_BASE_URL]);

    // 3. Efecto para manejar la carga inicial de la wishlist (al montar el componente o cambiar usuario/token)
    useEffect(() => {
        if (user && token) {
          //  console.log("useEffect [user, token]: Usuario logueado. Sincronizando wishlist al iniciar sesión...");
            if (user.wishlist && Array.isArray(user.wishlist)) {
                setWishlist(user.wishlist);
               // console.log("useEffect [user, token]: Wishlist inicializada con datos del usuario de auth:", user.wishlist.length, "items.");
            } else {
                // console.warn("useEffect [user, token]: user.wishlist no está disponible o es inválida en el objeto user. Fetching de la DB...");
                 fetchUserWishlistFromDB();
            }
            localStorage.removeItem('guestWishlist');
        } else {
        //    console.log("useEffect [user, token]: Usuario no logueado. Cargando wishlist de localStorage (modo invitado).");
            const localWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];
            setWishlist(localWishlist);
            setIsLoading(false);
        }
    }, [user, token, fetchUserWishlistFromDB]); // Ahora fetchUserWishlistFromDB ya está definida

    // 4. Efecto para sincronizar la wishlist con la DB cada vez que el estado local `wishlist` cambia Y el usuario está logueado
    useEffect(() => {
        if (!isLoading && user && token) {
           // console.log("useEffect [wishlist, sync]: Llamando a updateWishlistInDB con la wishlist actual.");
            updateWishlistInDB(wishlist);
        } else if (!user) {
           // console.log("useEffect [wishlist, sync]: Usuario no logueado. Guardando wishlist en localStorage.");
            localStorage.setItem('guestWishlist', JSON.stringify(wishlist));
        }
    }, [wishlist, isLoading, user, token, updateWishlistInDB]);

    // 5. Función para añadir/eliminar un producto de la wishlist local
    const toggleWishlistItem = useCallback((product) => {
        if (typeof product !== 'object' || !product.id) {
           // console.warn("toggleWishlistItem: Se requiere un objeto de producto completo con 'id'.");
            return;
        }

        setWishlist(prevWishlist => {
            const isItemInWishlist = prevWishlist.some(item => item.id === product.id);
            let newWishlist;
            if (isItemInWishlist) {
                newWishlist = prevWishlist.filter(item => item.id !== product.id);
              //  console.log("toggleWishlistItem: Eliminado producto con ID", product.id, ". Nueva wishlist:", newWishlist);
            } else {
                newWishlist = [...prevWishlist, product];
               // console.log("toggleWishlistItem: Añadido producto con ID", product.id, ". Nueva wishlist:", newWishlist);
            }
            return newWishlist;
        });
    }, []);

    // 6. Función para fusionar la wishlist de invitado con la de usuario (llamada al iniciar sesión/registro)
    const synchronizeWishlist = useCallback(async () => {
      //  console.log("synchronizeWishlist: Iniciando proceso de fusión de wishlist.");
        if (!user || !token) {
           // console.warn("synchronizeWishlist: No hay usuario logueado o token. No se puede sincronizar.");
            return;
        }

        const localGuestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];
       // console.log("synchronizeWishlist: Wishlist de invitado local encontrada:", localGuestWishlist.length, "items.");

        try {
            const responseDB = await axios.get(`${API_BASE_URL}/api/wishlist`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userDBWishlist = responseDB.data;
           // console.log("synchronizeWishlist: Wishlist del usuario en DB encontrada:", userDBWishlist.length, "items.");

            const mergedWishlistMap = new Map();
            userDBWishlist.forEach(item => mergedWishlistMap.set(item.id, item));
            localGuestWishlist.forEach(item => mergedWishlistMap.set(item.id, item));

            const mergedWishlist = Array.from(mergedWishlistMap.values());
           // console.log("synchronizeWishlist: Wishlist fusionada final:", mergedWishlist.length, "items.", mergedWishlist);

            await updateWishlistInDB(mergedWishlist);
            setWishlist(mergedWishlist);
            localStorage.removeItem('guestWishlist');

          //  console.log("synchronizeWishlist: Sincronización completada con éxito.");
        } catch (error) {
           console.error("synchronizeWishlist: Error durante la sincronización de wishlist:", error.response ? error.response.data : error.message);
            setError('Error durante la sincronización inicial de la wishlist.');
        }
    }, [user, token, API_BASE_URL, updateWishlistInDB]);

    const value = {
        wishlist,
        isLoading,
        error,
        toggleWishlistItem,
        synchronizeWishlist,
        fetchUserWishlistFromDB,
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};