// src/pages/BookDetailPage.jsx
import React, { useState, useEffect, createContext, useCallback, useContext} from 'react';
import { useAuth } from './UseAuth';
import axios from 'axios';
import { API_BASE_URL } from './WishListBook';

// Asegúrate de que esta variable de entorno apunte a tu backend
const API_URL = import.meta.env.VITE_APP_API_URL; 
console.log("CartContext: API_URL cargada:", API_URL);

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // useAuth provee el usuario, una función para obtener el token y el estado de autenticación.
    const { user, getToken, isAuthenticated } = useAuth();
    const apiUrl = API_URL;

    // Estado local del carrito, inicializado desde localStorage
    const [cart, setCart] = useState(() => {
        try {
            // Usa una clave consistente basada en el estado de autenticación del usuario.
            const localStorageKey = `cart_${user && isAuthenticated ? user.id : 'guest'}`;
            const localCart = localStorage.getItem(localStorageKey);
            // Al cargar, asegúrate de que cada ítem tenga una propiedad 'quantity', por defecto 1.
            return localCart ? JSON.parse(localCart).map(item => ({ ...item, quantity: item.quantity || 1 })) : [];
        } catch (error) {
            console.error("Error al parsear el carrito de localStorage:", error);
            return [];
        }
    });

    // Función para sincronizar el carrito con la base de datos
    // Usamos useCallback para memoizar la función y evitar re-renders innecesarios
    const updateCartInDB = useCallback(async (currentCart) => {
        // Solo sincronizamos si hay un usuario autenticado con un ID válido
        if (!isAuthenticated || !user?.id) {
            console.log("updateCartInDB: Usuario no autenticado o sin ID, no se sincroniza con la DB.");
            return;
        }

        const token = getToken(); // Obtenemos el token de autenticación
        if (!token) {
            console.warn("updateCartInDB: No se encontró token de autenticación para sincronizar el carrito.");
            return;
        }

        // Asegúrate de que 'currentCart' sea un array válido.
        const cartDataToSend = Array.isArray(currentCart) ? currentCart : [];

        // Mapeamos el array de objetos de libro del frontend a un array de objetos
        // con `bookId` y `quantity` para enviarlo al backend.
        const cartItemsForDB = cartDataToSend.map(item => ({
            bookId: item.id, // Asumimos que 'item.id' es el ID del libro en tu DB
            quantity: item.quantity || 1 // Asegura que siempre se envíe una cantidad (por defecto 1)
        }));

        console.log("updateCartInDB: Se ha llamado.");
        console.log(`updateCartInDB: user = ${user?.username} (ID: ${user?.id}), token = ${token ? "Existe Token" : "No Existe Token"}`);
        console.log(`FRONTEND: Enviando ítems de carrito a DB para usuario ${user.id} : `, cartItemsForDB); // Log para depuración

        try {
            // Envía un objeto con la propiedad 'cartItems' que contiene el array de { bookId, quantity }
            await axios.put(`${apiUrl}/api/cart/sync`, { cartItems: cartItemsForDB }, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token para la autenticación
                }
            });
            console.log("Carrito sincronizado con la DB exitosamente.");
        } catch (error) {
            console.error("FRONTEND: ERROR DE AXIOS (red o servidor):", error);
            if (error.response) {
                console.error("Detalles del error de respuesta:", error.response.data);
                console.error("Estado del error:", error.response.status);
                console.error("Mensaje del error:", error.response.data.message || error.response.data.error);
            } else if (error.request) {
                console.error("No se recibió respuesta del servidor:", error.request);
            } else {
                console.error("Error al configurar la petición:", error.message);
            }
        }
    }, [isAuthenticated, user, getToken, apiUrl]); // Dependencias para useCallback

    // Efecto para cargar el carrito del usuario desde la DB al montar el componente
    // o cuando cambian el usuario/estado de autenticación
    useEffect(() => {
        const fetchUserCartFromDB = async () => {
            if (isAuthenticated && user?.id) { // Solo si hay un usuario logueado y autenticado
                const token = getToken();
                if (!token) {
                    console.warn("No hay token al intentar cargar el carrito del usuario.");
                    setCart([]); // Vaciamos el carrito si no hay token para evitar inconsistencias
                    return;
                }

                try {
                    console.log(`[CartContext] Cargando carrito inicial desde el backend para usuario ${user.id}...`);
                    // Realiza una petición GET para obtener el carrito del usuario
                    const response = await axios.get(`${apiUrl}/api/cart`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    // Mapea la 'quantity' de la DB a 'quantity' en el estado del frontend.
                    setCart(response.data.map(item => ({
                        ...item,
                        quantity: item.quantity || 1 // Asegúrate de que este nombre de propiedad coincida con lo que devuelve tu backend
                    })));
                    console.log("Carrito cargado de la DB:", response.data);
                } catch (error) {
                    console.error("Error al cargar el carrito de la DB:", error);
                    // Si hay un error al cargar desde la DB, limpia el carrito local
                    setCart([]); 
                }
            } else {
                // Si no hay usuario autenticado, carga el carrito del invitado desde localStorage
                console.log("[CartContext] No hay usuario autenticado, cargando carrito de localStorage (invitado).");
                const localCart = localStorage.getItem('cart_guest');
                // Asegúrate de que los ítems del carrito de invitado también tengan 'quantity'
                setCart(localCart ? JSON.parse(localCart).map(item => ({ ...item, quantity: item.quantity || 1 })) : []);
            }
        };

        fetchUserCartFromDB();
    }, [isAuthenticated, user?.id, getToken, apiUrl]); // Se ejecuta cuando estas dependencias cambian

    // Efecto para guardar el carrito en localStorage y sincronizar con la DB
    useEffect(() => {
        // Determina la clave de localStorage basándose en el estado de autenticación
        const localStorageKey = `cart_${user && isAuthenticated ? user.id : 'guest'}`;
        // Guarda el carrito en localStorage para persistencia offline o de invitado
        localStorage.setItem(localStorageKey, JSON.stringify(cart));
        console.log(`Carrito guardado en localStorage (${localStorageKey}).`);

        // Si hay un usuario logueado, sincroniza con la DB.
        // Usamos un pequeño "debounce" para evitar llamadas excesivas al cambiar la cantidad rápidamente.
        const syncTimer = setTimeout(() => {
            if (isAuthenticated && user?.id) {
                console.log("useEffect [cart]: Llamando a updateCartInDB con el carrito actual para sincronizar.");
                updateCartInDB(cart); // Pasa el estado 'cart' actual explícitamente
            }
        }, 500); // Sincroniza después de 500ms de inactividad

        return () => clearTimeout(syncTimer); // Limpia el timer si el carrito cambia de nuevo antes de que se dispare
    }, [cart, isAuthenticated, user, updateCartInDB]); // 'updateCartInDB' debe ser una dependencia si se usa aquí

    // Funciones para manipular el carrito
    const addToCart = useCallback((book, quantity = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === book.id);

            let newCart;
            if (existingItem) {
                const updatedQuantity = existingItem.quantity + quantity;
                // Aseguramos que la cantidad no baje de 1 si solo estamos añadiendo (ej. desde un botón de "añadir")
                newCart = prevCart.map(item =>
                    item.id === book.id
                        ? { ...item, quantity: Math.max(1, updatedQuantity) }
                        : item
                );
                console.log(`Carrito actualizado: ${book.title}, Cantidad incrementada a: ${Math.max(1, updatedQuantity)}`);
            } else {
                // Si el ítem no existe, lo añadimos con la cantidad especificada (asegurando al menos 1)
                newCart = [...prevCart, { ...book, quantity: Math.max(1, quantity) }];
                console.log(`Libro añadido al carrito: ${book.title}, Cantidad: ${Math.max(1, quantity)}`);
            }
            return newCart;
        });
    }, []); // Dependencias vacías para useCallback ya que no usa valores externos mutables

    const updateItemQuantity = useCallback((bookId, newQuantity) => {
        setCart(prevCart => {
            const parsedNewQuantity = parseInt(newQuantity, 10);
            if (isNaN(parsedNewQuantity) || parsedNewQuantity <= 0) {
                // Si la nueva cantidad es inválida (NaN) o 0 o menos, elimina el ítem del carrito
                console.log(`Eliminando item ${bookId} del carrito. Cantidad inválida o <= 0: ${parsedNewQuantity}`);
                return prevCart.filter(item => item.id !== bookId);
            } else {
                // Actualiza la cantidad del ítem
                console.log(`Actualizando item ${bookId} a cantidad: ${parsedNewQuantity}`);
                return prevCart.map(item =>
                    item.id === bookId ? { ...item, quantity: parsedNewQuantity } : item
                );
            }
        });
    }, []); // Dependencias vacías para useCallback

    const removeItemFromCart = useCallback((bookId) => {
        setCart(prevCart => {
            console.log(`Removiendo item ${bookId} del carrito.`);
            return prevCart.filter(item => item.id !== bookId);
        });
    }, []); // Dependencias vacías para useCallback

    const clearCart = useCallback(() => {
        setCart([]);
        console.log("Carrito vaciado.");
    }, []); // Dependencias vacías para useCallback

    // Calcular el conteo total de ítems y el precio total
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cart,
            cartCount,
            cartTotalPrice,
            addToCart,
            updateItemQuantity,
            removeItemFromCart, 
            clearCart
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



