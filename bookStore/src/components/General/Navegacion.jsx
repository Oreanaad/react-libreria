 
 import './Navegacion.css';
import { Link } from 'react-router-dom';

 const Navegacion = () => {


    return (
 <nav className="secondary-nav">
                <div className='nav_margin'>
                    <a href="/home">Inicio</a>
                    <a href="/tienda">Tienda</a>
                    <a href="/nosotros">Nosotros</a>
                    <a href="/contacto">Contacto</a>
                    </div>
                </nav>
    );
};

export default Navegacion;