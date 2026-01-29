import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';
import HomePage from './pages/HomePage';
import Tienda from './pages/Tienda';
import Header from './components/General/Header';
import Footer from './components/General/Footer';
import BookDetailPage from './components/DetalleLibro/BooksDetails';
import LogInForm from './pages/LogIn';
import Register from './pages/Registro';
import ForgotPassword from './pages/ForgetPassword';
import ConfirmEmailPage from './pages/ConfirmarEmail';
import './App.css'
import MiPerfil from './pages/Perfil';
import { WishlistProvider} from './context/WishListBook';
import { AuthProvider } from './context/AuthContext.jsx'
import { useState } from 'react';
import WishlistDisplay from './components/WishList/WishListSideBar.jsx';
import { CartProvider } from './context/CartContext.jsx';
import CartDisplay from './components/Cart/CartSideBar.jsx'
import FinalizarCompra from './pages/FinalizarCompra.jsx'
import OrderConfirmationPage from './components/Compra/OrderConfirmation.jsx';
import ResettPassword from './pages/ResetPassword.jsx';

import { Toaster } from 'react-hot-toast';

function App() {

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const[isCartOpen, setIsCartOpen] =useState(false)

 const handleToggleCart = () => {
    setIsCartOpen(prev => !prev);
    // Opcional: cierra la wishlist si abres el carrito
    if (!isCartOpen) setIsWishlistOpen(false); 
  };

  // Función para alternar la visibilidad de la wishlist
  const handleToggleWishlist = () => {
    setIsWishlistOpen(prev => !prev);
    // Opcional: cierra el carrito si abres la wishlist
    if (!isWishlistOpen) setIsCartOpen(false); 
  };

 
return (
<BrowserRouter>
      <AuthProvider>
      <WishlistProvider>
        <CartProvider>
      
      <Header 
      onToggleWishlist={handleToggleWishlist}
      onToggleCart={handleToggleCart} />
      {isCartOpen && <CartDisplay onClose={handleToggleCart} />}

      {isWishlistOpen && <WishlistDisplay onClose={handleToggleWishlist}/>}
      <Routes>
        <Route path="/" element={<HomePage />} /> 
        <Route path="/logIn" element={<LogInForm/>} /> 
        <Route path="/home" element={<HomePage />} /> 
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/tienda" element={<Tienda/>} />
        <Route path="/contacto" element={<Contacto/>} />
        <Route path="/libros/:id" element={<BookDetailPage />} />
        <Route path="/registrar" element={<Register/>}/>
        <Route path ="/perfil" element={<MiPerfil/>}/>
        <Route path="/confirmarEmail" element={<ConfirmEmailPage/>}/>
        <Route path="/resetPassword" element={<ForgotPassword/>}/>
        <Route path= '/finalizarCompra' element={<FinalizarCompra/>}></Route>
        <Route path="/order-confirmation" element = {<OrderConfirmationPage/>}></Route>
        <Route path="/resettpassword/:token" element={<ResettPassword />} />
        <Route path="*" element={<h2>404: Página no encontrada</h2>} />
      </Routes>
      <Footer />
   <Toaster />
    </CartProvider>
    </WishlistProvider>
    </AuthProvider>
    
       </BrowserRouter>
       
  );
}


export default App
