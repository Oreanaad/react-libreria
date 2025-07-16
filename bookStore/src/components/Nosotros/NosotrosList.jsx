import './NosotrosList.css'
import SectionHeader from '../Index/SectionHeader';
import {MetodosList as allMetodosData } from './Metodos'
import {EnviosList as allEnvioData} from './Envio'

import {useState, useEffect} from 'react';
import PagoList from './PagoList';

function NosotrosList (){

    const nosotrosImg = '../../../public/img/nosotros.png'

    
  const [metodos, setMetodo] = useState([])
  const [envios, setEnvio] =useState([])
 

  useEffect(()=>{
       setMetodo(allMetodosData)
       setEnvio(allEnvioData)
     
  },[])




    return(
        <>
        <div className='List-container'>
        <div className="section-nosotros-container">
      <div className="section-line-nosotros"></div>
      <div className="section-icon-nosotros">B</div>
      <h2 className="section-title-nosotros">Sobre Booksflea: <span>Tu Refugio Literario</span></h2>
      <div className="section-line-nosotros"></div>
    </div>

       <div className='List-container-2'>
       <div>
         
        <p >Desde 2018, Booksflea ha sido más que una librería; somos un punto de encuentro para amantes de los libros en Valencia, Venezuela. En nuestro catálogo encontrarás más de 50,000 títulos, con una selección cuidadosa que incluye lo mejor en literatura contemporánea, narrativa y filosofía. Nos encanta ofrecer una gran variedad para que cada lector encuentre su próxima gran historia.

En Booksflea, no solo vendemos libros; creamos una comunidad apasionada por la literatura. ¡Nos encanta compartir la magia de cada página y esperamos que tú también disfrutes de felices lecturas con nosotros!</p>

       </div>
       <div>
        <img src={nosotrosImg} alt='IMg'/>
       </div>
       </div>
</div>
        <SectionHeader  icon="M" title="Métodos de pago" />
         <PagoList metodos={metodos} />

        <SectionHeader  icon="O" title="Opciones de envío" />
        <PagoList className='prueba' metodos={envios} />

        
        <SectionHeader  icon="P" title="Pickup" />

        <div className='List-container-pickup' >
          <div className='List-container-2-pickup'>
            <img src="../../../public/img/pickup.png"></img>
            <div>

              <ul>
                <li>Valencia (C.C. Mediterranea Plaza) lunes a domingo 10:00am a 6:00pm </li>
                <li>Maracay (Cafebreria) lunes a domingo de 12:00 pm a 6:00pm</li>
                <li>Valencia (Cafe Booksflea) lunes a domingo 10:00am a 6:00pm</li>
              </ul>
         
   
          </div>
          </div>
          </div>
       </>
    )
}

export default  NosotrosList;