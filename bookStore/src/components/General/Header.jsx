// src/components/Header.jsx
import React from 'react';
import './Header.css'; 
import { Link } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext'; // ajustá la ruta si cambia
import { useNavigate } from 'react-router-dom';
import  { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/UseAuth';
import { useWishlist } from '../../context/WishListBook';

// RECIBE LA PROP onToggleWishlist
const Header = ({ onToggleWishlist, onToggleCart }) => { // <--- AÑADE ESTO

    const logo = '../../../public/img/booksflea-logo.png';
    const lupa = '../../../public/img/lupa.png';
    const userIcon = '../../../public/img/user.png';
    const shoppingBagIcon = '../../../public/img/cart2.png';
    const heartIcon = '../../../public/img/amor2.png'
  

    const [inputValue, setInputValue] = useState('');
    const { setSearchTerm } = useSearch();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { wishlist } = useWishlist();
  

    const handleSearch = () => {
        setSearchTerm(inputValue);
        navigate('/tienda');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleMenuNavigation = (path) => {
        setIsUserMenuOpen(false);
        navigate(path);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(prev => !prev);
    };

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    return (
        <header className="main-header">
            <Link to="/" className="header-logo-link">
                <div className="header-logo">
                    <img src={logo} alt="Logo" />
                </div>
            </Link>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Título, Autor, año..."
                    className="search-input-fancy"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleSearch} className="search-button-fancy">
                    <img src={lupa} alt="Buscar" />
                </button>
            </div>

            <div className="header-actions">
               
                <button
                    className="action-button wishlist-button"
                    onClick={onToggleWishlist} 
                >
                   
                    <i className="fas fa-heart"></i>
                     <img src={heartIcon} className="wishlist-icon" alt="Wishlist" /> 

                    {wishlist.length > 0 && (
                        <span className="wishlist-count"></span>
                    )}
                </button>
                

                <div
                    className="user-menu-container"
                    ref={userMenuRef}
                >
                    <button
                        className="action-button user-icon-button"
                        onClick={toggleUserMenu}
                    >
                        <img src={userIcon} alt="Usuario" />
                    </button>
                    {isUserMenuOpen && (
                        <div className="user-dropdown-menu">
                            {user ? (
                                <>
                                    <button className="dropdown-item" onClick={() => handleMenuNavigation('/perfil')}>Mi Perfil ({user.username})</button>
                                    <button className="dropdown-item" onClick={handleLogout}>Cerrar Sesión</button>
                                </>
                            ) : (
                                <button className="dropdown-item" onClick={() => handleMenuNavigation('/login')}>Iniciar Sesión</button>
                            )}
                        </div>
                    )}
                </div>

                <button 
                className="action-button newheart-button"
                onClick={onToggleCart}
                >
                       <img src={shoppingBagIcon} className="wishlist-icon"alt="Carrito de compras" />
                  
               
                </button>
            </div>
        </header>
    );
};

export default Header;