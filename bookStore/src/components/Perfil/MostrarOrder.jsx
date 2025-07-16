
import OrdersTable from './OrdersTable';
import { useState } from 'react';
import axios from 'axios';


const ButtonOrder = () =>{
    const [showOrdersTable, setShowOrdersTable] = useState(false);
    const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false); 
  const [errorOrders, setErrorOrders] = useState(null); 

const handleToggleOrders = async () => {
    setShowOrdersTable(prevShowOrdersTable => !prevShowOrdersTable);

    if (!showOrdersTable)
      setLoadingOrders(true);
      setErrorOrders(null); 
      try {
        const response = await axios.get('http://localhost:3001/api/orders');
        setOrders(response.data);
      } catch (err) {
        console.error('Error al cargar los pedidos:', err);
        setErrorOrders('Error al cargar los pedidos. Inténtalo de nuevo.');
        setOrders([]); 
      } finally {
        setLoadingOrders(false);
      }
    }

return (
    <>
  
      <button className='orders-button' onClick={handleToggleOrders}>
        {showOrdersTable ? 'Ocultar Pedidos' : 'Mostrar Pedidos'}
      </button>

      {showOrdersTable && ( // Solo renderiza este bloque si showOrdersTable es true
        <>
          {loadingOrders && <div>Cargando pedidos...</div>}
          {errorOrders && <div style={{ color: 'red' }}>{errorOrders}</div>}
          {!loadingOrders && !errorOrders && orders.length > 0 && (
            <OrdersTable orders={orders} /> // Pasa los pedidos obtenidos como una prop
          )}
          {!loadingOrders && !errorOrders && orders.length === 0 && (
            // Solo muestra "No hay pedidos" si no está cargando, no hay error y el array de pedidos está vacío
            <div>No hay pedidos disponibles.</div>
          )}
        </>
      )}
    </>
  );
};

export default ButtonOrder;