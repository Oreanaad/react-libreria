import './OrdersTable.css'
import axios from 'axios'
import { useState } from 'react'

const OrdersTable =({orders=[]})=>{

    const [selectedOrderItems, setSelectedOrderItems] = useState(null); // Para guardar los ítems del pedido seleccionado
    const [showItemsModal, setShowItemsModal] = useState(false);
  
    const handleViewDetails = async (orderId) => {
        try {
            // Llama a la nueva API de ítems
            const response = await axios.get(`http://localhost:3001/api/orders/${orderId}/items`);
            setSelectedOrderItems(response.data);
            setShowItemsModal(true); // Abre el modal con los detalles
        } catch (error) {
            console.error('Error al cargar los detalles del pedido:', error);
            alert('No se pudieron cargar los detalles del pedido.');
        }
    };

      
     return (
        <div className="orders-table-container">
            <table>
                <thead>
                    <tr>
                        <th>Pedido</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Total</th>
                         <th>Direccion</th>
                        <th>Acciones</th>
                       
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan="5">No hay pedidos disponibles.</td>
                        </tr>
                    ) : (
                        orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.date}</td>
                                <td>{order.status}</td>
                                <td>{order.total}</td>
                                <td>{order.direccion}</td>
                                <td>
                                    {/* Pasa el order.id (el número, sin el #) al manejador */}
                                    <button
                                        className="view-button"
                                        onClick={() => handleViewDetails(order.id.replace('#', ''))}
                                    >
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Modal para mostrar los ítems del pedido */}
            {showItemsModal && selectedOrderItems && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Detalles del Pedido #{selectedOrderItems[0]?.OrderId }</h2>
                        <ul>
                            {selectedOrderItems.map(item => (
                                <li key={item.OrderItemId}>
                                    {item.Title} (x{item.Quantity}) - ${item.Price.toFixed(2)} c/u
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowItemsModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersTable;