
import SectionHeader from "../Index/SectionHeader";
import { useState, useEffect} from "react";
import { useAuth } from "../../context/UseAuth";
import './PerfilInfo.css'
import axios from "axios";
import OrdersTable from "./OrdersTable";


const PerfilInfo = () => { // Removed 'orders: initialOrders' prop if fetching internally
    const { user, loading: loadingUser, token } = useAuth(); // Ensure you get the token if your auth context provides it
    const [localOrders, setLocalOrders] = useState([]); // State to store fetched orders
    const [loadingOrders, setLoadingOrders] = useState(false); // Correctly manage boolean loading state
    const [errorOrders, setErrorOrders] = useState(null); // State for order fetching errors

    // This useEffect will be responsible for fetching the user's orders
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || !token) { // Ensure user and token are available before fetching
                // If no user or token, we cannot fetch orders.
                // This might happen if the user isn't logged in or token is not yet loaded.
                setLoadingOrders(false); // Stop loading if no user/token
                return;
            }

            setLoadingOrders(true); // Set loading to true before starting fetch
            setErrorOrders(null); // Clear previous errors

            try {
                // Ensure your backend endpoint for user-specific orders is correct
                const response = await axios.get(`http://localhost:3001/api/orders/user/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Use the token for authorization
                    }
                });
                setLocalOrders(response.data); // Set the fetched data to localOrders state
            } catch (err) {
                console.error('Error al cargar los pedidos:', err);
                if (err.response && err.response.status === 401) {
                    setErrorOrders('Tu sesión ha expirado o no estás autorizado para ver los pedidos. Por favor, inicia sesión de nuevo.');
                    // Potentially trigger a logout or token refresh if your auth context supports it
                } else {
                    setErrorOrders('Error al cargar tus pedidos. Por favor, inténtalo de nuevo.');
                }
                setLocalOrders([]); // Clear orders on error
            } finally {
                setLoadingOrders(false); // Always set loading to false after fetch attempt
            }
        };

        // Call the fetch function when the component mounts or when 'user' or 'token' changes
        fetchOrders();
    }, [user, token]); // Dependencies array: re-run effect if user or token changes

    // --- Loading and Error Handling for User Authentication ---
    if (loadingUser) {
        return (
            <div className="section-perfil-container">
                <p>Cargando información del perfil...</p>
            </div>
        );
    }

    if (!user) {
        // If user is null after loading, it means no user is logged in.
        return (
            <div className="section-perfil-container">
                <p>No se pudo cargar la información del usuario. Por favor, inicia sesión.</p>
                {/* Optionally, add a link to the login page */}
            </div>
        );
    }

    // --- Render PerfilInfo once user is loaded ---
    return (
        <>
            <div className="section-nosotros-container">
                <div className="section-line-nosotros"></div>
                <div className="section-icon-nosotros">N</div>
                <h2 className="section-title-nosotros">Mi Perfil</h2>
                <div className="section-line-nosotros"></div>
            </div>
            <div className="section-perfil-container">
                <div className="List-container-Perfil">
                    <p className="p-title-perfil">Hola {user.username}</p>
                    <p>Desde el escritorio de tu cuenta puedes ver tus pedidos recientes y los detalles de tu cuenta.</p>
                </div>

                {/* Conditional rendering for orders table based on loading/error states */}
                {loadingOrders ? (
                    <p>Cargando tus pedidos...</p>
                ) : errorOrders ? (
                    <p className="error-message">{errorOrders}</p>
                ) : (
                    <OrdersTable orders={localOrders} /> // Pass localOrders to the table
                )}
            </div>
        </>
    );
};

export default PerfilInfo;