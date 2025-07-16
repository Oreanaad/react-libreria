import './MetodosPago.css'

const MetodoPago = ({metodo})=>{
  
    
     return (
    <div className="pago-card">
      <div className="pago-image-container">
        <img src={metodo.image} alt={metodo.name} className="pago-image" />
      </div>
      <div className="pago-info">
        <h3 className="pago-title">{metodo.name}</h3>
      </div>
    </div>
  );
}

export default MetodoPago;