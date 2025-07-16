import React from 'react';
import BookSectionsContainer from '../components/Index/BookSectionsContainer'; // Asumo que este es tu componente principal de Home
import Navegacion from '../components/General/Navegacion'; 
import Slider from '../components/Index/Slider';
import '../../public/img/Slider1.png'
import Slider1 from '../../public/img/Slider1.png'
import Slider2 from '../../public/img/Slider2.png'
import Slider3 from '../../public/img/Slider3.png'

   
function HomePage() {

     const imagesForSlider = [
    Slider1,
    Slider2,
    Slider3,]


  return (
    <div className="App">

            <Navegacion/>
            <Slider images={imagesForSlider} />
         <BookSectionsContainer />
       
          
        </div>
  );
}
export default HomePage;