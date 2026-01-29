import './OrdersTable.css'
import axios from 'axios'
import { useState } from 'react'

const OrdersTable =({orders=[]})=>{

const [selectedOrderItems, setSelectedOrderItems] = useState(null); 
const [showItemsModal, setShowItemsModal] = useState(false);

 const handleViewDetails = async (orderId) => {
 try {
 const response = await axios.get(`http://localhost:3001/api/orders/${orderId}/items`);
  setSelectedOrderItems(response.data);
setShowItemsModal(true);
} catch (error) {
console.error('Error al cargar los detalles del pedido:', error);
 alert('No se pudieron cargar los detalles del pedido.');
 }
 };

 const formatDate = (dateString) => {
 if (!dateString) return '';
const date = new Date(dateString);
return date.toLocaleDateString(); 
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
<tr key={order.orderId}>
<td>{order.orderId}</td>
 <td>{formatDate(order.orderDate)}</td>
 <td>{order.status}</td>
 <td>{order.totalPrice}$ </td>
 <td>{order.address}</td>
 <td>
 <button
 className="view-button"
 onClick={() => handleViewDetails(order.orderId)}
>
Ver
 </button>
 </td>
 </tr>
))
)}
 </tbody>
 </table>
 {showItemsModal && selectedOrderItems && (
<div className="modal-overlay">
 <div className="modal-content">
 <h2>Detalles del Pedido #{selectedOrderItems[0]?.orderId }</h2>
 <ul>
 {selectedOrderItems.map(item => (
 <li key={item.orderItemId}>
 {item.title} (x{item.quantity}) - ${item.price.toFixed(2)} c/u
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