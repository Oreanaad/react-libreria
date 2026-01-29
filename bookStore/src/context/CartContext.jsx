// src/context/CartContext.jsx
// Asegúrate de que este archivo esté en src/context/ y las importaciones relativas sean correctas.

import React, { useState, useEffect, createContext, useCallback, useContext} from 'react';
import { useAuth } from './UseAuth'; // Asegúrate de que la ruta a useAuth sea correcta
import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL;
console.log("CartContext: API_URL cargada:", API_URL);

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Obtenemos el usuario, token y estado de autenticación de useAuth.
    // authLoading es crucial para saber si el estado de autenticación ya ha sido determinado.
    const { user, getToken, isAuthenticated, isLoading: authLoading } = useAuth();
    const apiUrl = API_URL;

    // --- Estados ---
    const [cart, setCart] = useState([]);
    const [isLoadingCart, setIsLoadingCart] = useState(true); // Indica si el carrito está en proceso de carga inicial

    // --- Funciones Auxiliares ---

    // Determina la clave de localStorage basándose en el estado de autenticación
    const getLocalStorageKey = useCallback(() => {
        if (isAuthenticated && user?.id) {
            return `cart_${user.id}`;
        }
        return 'cart_guest'; // Siempre 'cart_guest' para no autenticados
    }, [isAuthenticated, user]);

    // --- Lógica de Sincronización con la Base de Datos ---

    // Función para sincronizar el carrito local con la base de datos
    const updateCartInDB = useCallback(async (currentCart) => {
        console.log("updateCartInDB: Iniciando sincronización con DB.");
        if (authLoading) { // No intentar sincronizar si AuthContext aún está cargando
            console.log("updateCartInDB: AuthContext está cargando, posponiendo sincronización.");
            return;
        }
        if (!isAuthenticated || !user?.id) {
            console.log("updateCartInDB: Usuario no autenticado o sin ID. No se sincroniza con la DB.");
            return;
        }

        const token = getToken();
        if (!token) {
            console.warn("updateCartInDB: No se encontró token de autenticación para sincronizar el carrito.");
            return;
        }

        const cartDataToSend = Array.isArray(currentCart) ? currentCart : [];
        const cartItemsForDB = cartDataToSend.map(item => ({
            bookId: item.id, // Asumimos que 'item.id' es el ID del libro en tu DB
            quantity: item.quantity || 1
        }));

        console.log(`updateCartInDB: Sincronizando carrito para usuario ${user.id}:`, cartItemsForDB);

        try {
            await axios.put(`${apiUrl}/api/cart/sync`, { cartItems: cartItemsForDB }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Carrito sincronizado con la DB exitosamente.");
        } catch (error) {
            console.error("ERROR: Fallo al sincronizar el carrito con la DB:", error);
            if (error.response) {
                console.error("Detalles del error de respuesta:", error.response.data);
                console.error("Estado del error:", error.response.status);
            } else if (error.request) {
                console.error("No se recibió respuesta del servidor:", error.request);
            } else {
                console.error("Error al configurar la petición:", error.message);
            }
        }
    }, [isAuthenticated, user, getToken, apiUrl, authLoading]); // authLoading como dependencia

    // --- Lógica de Carga del Carrito (DB o LocalStorage) ---

    // Función para cargar el carrito del usuario desde la DB
    const fetchUserCartFromDB = useCallback(async () => {
        console.log("fetchUserCartFromDB: Intentando cargar desde DB.");
        if (!isAuthenticated || !user?.id) {
            console.log("fetchUserCartFromDB: No autenticado, no se carga de DB.");
            return [];
        }

        const token = getToken();
        if (!token) {
            console.warn("fetchUserCartFromDB: No hay token para cargar de DB.");
            return [];
        }

        try {
        const response = await axios.get(`${apiUrl}/api/cart`, { // Esta es la petición GET
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // Aquí se espera que response.data sea { cart: [...] }
        const fetchedCart = Array.isArray(response.data.cart) ? response.data.cart : []; // <-- ¡CRÍTICO!
        console.log("fetchUserCartFromDB: Carrito cargado de DB exitosamente:", fetchedCart); // Verifica el contenido
        return fetchedCart.map(item => ({ ...item, quantity: item.quantity || 1 }));
    } catch (error) {
        console.error("ERROR: Fallo al cargar el carrito de la DB:", error);
        // Si el error es 404 o 500, esto lo captura.
        return []; // Retorna un array vacío para evitar que se rompa la aplicación
    }
}, [isAuthenticated, user, getToken, apiUrl]);

    // Función para cargar el carrito de invitado desde localStorage
    const loadGuestCartFromLocalStorage = useCallback(() => {
        console.log("loadGuestCartFromLocalStorage: Intentando cargar carrito de invitado.");
        try {
            const localCartString = localStorage.getItem('cart_guest');
            const localCart = localCartString ? JSON.parse(localCartString) : [];
            console.log("loadGuestCartFromLocalStorage: Carrito de invitado cargado:", localCart);
            return Array.isArray(localCart) ? localCart.map(item => ({ ...item, quantity: item.quantity || 1 })) : [];
        } catch (error) {
            console.error("ERROR: Fallo al parsear carrito de invitado desde localStorage:", error);
            localStorage.removeItem('cart_guest'); // Limpia datos corruptos
            return [];
        }
    }, []);

    // Función para fusionar el carrito de invitado con el del usuario al loguearse
    const synchronizeCartOnLogin = useCallback(async () => {
        console.log("synchronizeCartOnLogin: Iniciando proceso de fusión.");
        const localGuestCart = loadGuestCartFromLocalStorage(); // Carga el carrito de invitado

        if (Array.isArray(localGuestCart) && localGuestCart.length > 0) {
            console.log("synchronizeCartOnLogin: Carrito de invitado no vacío, intentando fusionar.");
            try {
                // Obtener el carrito actual del usuario desde la DB
                const userDBCart = await fetchUserCartFromDB();

                const mergedCartMap = new Map();
                // Añadir items del carrito de DB (prioridad inicial)
                userDBCart.forEach(item => mergedCartMap.set(item.id, item));
                // Añadir/Sobrescribir items del carrito de invitado (prioridad si el ID coincide)
                localGuestCart.forEach(item => mergedCartMap.set(item.id, item));

                const mergedCart = Array.from(mergedCartMap.values());
                console.log("synchronizeCartOnLogin: Carrito fusionado:", mergedCart);

                // Actualizar el carrito en la DB con el carrito fusionado
                await updateCartInDB(mergedCart); // Llama a la función de sincronización
                setCart(mergedCart); // Actualizar el estado local
                localStorage.removeItem('cart_guest'); // Limpiar el carrito de invitado
                console.log("synchronizeCartOnLogin: Sincronización y fusión completada. Carrito de invitado eliminado.");

            } catch (error) {
                console.error("ERROR: Fallo durante la sincronización inicial del carrito al loguearse:", error);
                // Si hay un error, al menos carga lo que hay en la DB para el usuario
                fetchUserCartFromDB().then(dbCart => setCart(dbCart));
            }
        } else {
            console.log("synchronizeCartOnLogin: No hay carrito de invitado para fusionar, cargando de DB.");
            // Si no hay carrito de invitado, simplemente carga el carrito del usuario de la DB
            const dbCart = await fetchUserCartFromDB();
            setCart(dbCart);
        }
    }, [fetchUserCartFromDB, updateCartInDB, loadGuestCartFromLocalStorage, isAuthenticated, user]); // Añadir dependencias

    // --- Efectos de Carga y Persistencia ---

    // useEffect 1: Carga inicial del carrito cuando el estado de autenticación es conocido
    useEffect(() => {
        const loadInitialCart = async () => {
            if (authLoading) {
                console.log("useEffect [initialLoad]: AuthContext aún está cargando. Posponiendo carga del carrito.");
                return; // Espera a que AuthContext termine de cargar
            }

            console.log("useEffect [initialLoad]: AuthContext cargado. Iniciando carga del carrito.");
            setIsLoadingCart(true);

            if (isAuthenticated && user?.id) {
                // Si el usuario está autenticado, intentar fusionar/cargar de DB
                // Esto también maneja el escenario de login reciente.
                console.log(`useEffect [initialLoad]: Usuario ${user.id} autenticado. Intentando sincronizar/cargar.`);
                await synchronizeCartOnLogin();
            } else {
                // Si no hay usuario autenticado, cargar el carrito del invitado
                console.log("useEffect [initialLoad]: Usuario no autenticado. Cargando carrito de invitado.");
                const guestCart = loadGuestCartFromLocalStorage();
                setCart(guestCart);
            }
            setIsLoadingCart(false);
            console.log("useEffect [initialLoad]: Carga inicial del carrito finalizada.");
        };

        loadInitialCart();
    }, [authLoading, isAuthenticated, user, synchronizeCartOnLogin, loadGuestCartFromLocalStorage]);


    // useEffect 2: Persistencia del carrito en localStorage y sincronización con DB
    // Este efecto se ejecuta cada vez que 'cart' cambia.
    useEffect(() => {
        // No guardar/sincronizar si el carrito está en proceso de carga inicial
        if (isLoadingCart) {
            console.log("useEffect [cartChange]: Carrito aún en carga inicial. No se guarda/sincroniza.");
            return;
        }

        const localStorageKey = getLocalStorageKey();
        
        console.log(`useEffect [cartChange]: Guardando carrito en localStorage (${localStorageKey})...`);
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(cart));
            console.log(`Carrito guardado en localStorage (${localStorageKey}).`);
        } catch (error) {
            console.error("ERROR: Fallo al guardar en localStorage:", error);
        }

        // Si hay un usuario logueado, sincroniza con la DB.
        // Usamos un pequeño "debounce" para evitar llamadas excesivas.
        if (isAuthenticated && user?.id) {
            const syncTimer = setTimeout(() => {
                console.log("useEffect [cartChange]: Debounce terminado. Llamando a updateCartInDB para sincronizar.");
                updateCartInDB(cart);
            }, 500);

            return () => {
                console.log("useEffect [cartChange]: Limpiando debounce timer.");
                clearTimeout(syncTimer);
            };
        }
    }, [cart, isAuthenticated, user, isLoadingCart, updateCartInDB, getLocalStorageKey]);


    // --- Funciones para manipular el carrito (ya deberías tenerlas y estar bien) ---

    const addToCart = useCallback((book, quantity = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === book.id);
            let newCart;
            if (existingItem) {
                const updatedQuantity = existingItem.quantity + quantity;
                newCart = prevCart.map(item =>
                    item.id === book.id
                        ? { ...item, quantity: Math.max(1, updatedQuantity) }
                        : item
                );
                console.log(`addToCart: Incrementada cantidad para ${book.title}. Cantidad: ${Math.max(1, updatedQuantity)}`);
            } else {
                newCart = [...prevCart, { ...book, quantity: Math.max(1, quantity) }];
                console.log(`addToCart: Añadido ${book.title}. Cantidad: ${Math.max(1, quantity)}`);
            }
            return newCart;
        });
    }, []);

    const updateItemQuantity = useCallback((bookId, newQuantity) => {
        setCart(prevCart => {
            const parsedNewQuantity = parseInt(newQuantity, 10);
            if (isNaN(parsedNewQuantity) || parsedNewQuantity <= 0) {
                console.log(`updateItemQuantity: Eliminando item ${bookId}. Cantidad inválida: ${parsedNewQuantity}`);
                return prevCart.filter(item => item.id !== bookId);
            } else {
                console.log(`updateItemQuantity: Actualizando ${bookId} a cantidad: ${parsedNewQuantity}`);
                return prevCart.map(item =>
                    item.id === bookId ? { ...item, quantity: parsedNewQuantity } : item
                );
            }
        });
    }, []);

    const removeItemFromCart = useCallback((bookId) => {
        setCart(prevCart => {
            console.log(`removeItemFromCart: Removiendo item ${bookId}.`);
            return prevCart.filter(item => item.id !== bookId);
        });
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        console.log("clearCart: Carrito vaciado.");
    }, []);

    // Calcular el conteo total de ítems y el precio total
    const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const cartTotalPrice = cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);

    return (
        <CartContext.Provider value={{
            cart,
            cartCount,
            cartTotalPrice,
            addToCart,
            updateItemQuantity,
            removeItemFromCart,
            clearCart,
            isLoadingCart // Expone el estado de carga del carrito si es necesario
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};