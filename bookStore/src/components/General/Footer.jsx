import './Footer.css';
import { Link } from 'react-router-dom';
const Footer = () =>{

    const whatsappNumber = "584142065191";
    const whatsappMessage = "Hola, me gustaría ordenar un libro";
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    const instagramImg = '../../../public/img/instagram.png'; 
    const whatsappImg = '../../../public/img/whatsapp.png';
    const mailImg = '../../../public/img/email.png';

    const emailAddress = 'oreanadev@gmail.com';
    const emailSubject = encodeURIComponent('Consulta desde la página web');
    const emailBody = encodeURIComponent('Hola, me gustaría saber más sobre sus servicios. Mi   nombre es...');
    //const basicMailtoLink = `mailto:${emailAddress}`;
    const detailedMailtoLink = `mailto:${emailAddress}?subject=${emailSubject}&body=${emailBody}`;


    return(
        <footer className="main-footer">
            <div className="footer-content">
                <nav className="footer-nav">
                    <div className='footer-links'>
                        
                        <a className='links' href="https://www.instagram.com/booksflea/?igsh=aXFzN2ZhYTcxYXNj#">
                        <img src={instagramImg}></img></a>
                        <a className='links' href={whatsappLink}>
                     <img src={whatsappImg}></img> </a>
                        <a className='links' href={detailedMailtoLink}>
                            <img src={mailImg}></img></a>
                    </div>
                    </nav>
                    </div>
                    <div className="footer-content-text">
                <p className='p-content'>Todos los derechos reservados © Booksflea 2025 | Rif. J-50127757-5</p>
                <p className='p-content '>Desarrollado por Oreana Andrade <img></img></p>
            </div>
        </footer>
    )
}

export default Footer;