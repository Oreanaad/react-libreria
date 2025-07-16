
import './PagoList.css'
import MetodosPago from './MetodosPago'


const PagoList =({metodos})=>{
 if (!metodos || metodos.length === 0) {
    return <div className="no-books-message">No hay autores en esta sección.</div>;
  }


    return(
     <>
    
    <div className="metodo-list-grid">
      {metodos.map((metodo) => (
        <MetodosPago key={metodo.id} metodo={metodo} />
       
      ))}
    </div>
    </>
    )

}

export default PagoList;