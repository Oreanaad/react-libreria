import React from 'react';
 import BooksTienda from '../components/Tienda/BooksTienda';
import Navegacion from '../components/General/Navegacion';
import Slider from '../components/Index/Slider';
import '../../public/img/Slider1.png'
import Slider1 from '../../public/img/Slider1.png'
import Slider2 from '../../public/img/Slider2.png'
import Slider3 from '../../public/img/Slider3.png'

   
function Tienda() {


     const imagesForSlider = [
    Slider1,
    Slider2,
    Slider3,]



  return (
    <div className="App">
            
            <Navegacion/>
            <Slider images={imagesForSlider} />
            <BooksTienda />
          
        </div>
  );
}
export default Tienda;

