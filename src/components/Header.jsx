import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';

const Header = ({ onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleUserMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    onOpenAuth();
  };

  
  const getUserName = () => {
    if (!user || !user.email) return 'Пользователь';
    const email = user.email;
    
    const namePart = email.split('@')[0];
    
    return namePart.charAt(0).toUpperCase() + namePart.slice(1).split('.')[0];
  };

  const userName = getUserName();

  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          <div className="header__logo-section">
            <Logo />
            <p className="header__subtitle">Онлайн-тренировки для занятий дома</p>
          </div>
          {isAuthenticated && user ? (
            <div className="header__user-menu" ref={dropdownRef}>
              <button 
                className="header__user-btn" 
                onClick={handleUserMenuClick}
                type="button"
              >
                <div className="header__user-avatar">
                  <img 
                    src="/images/svg/profile-icon.svg" 
                    alt="Профиль"
                    className="header__user-avatar-img"
                  />
                </div>
                <span className="header__user-name">{userName}</span>
                <svg 
                  className={`header__user-arrow ${dropdownOpen ? 'header__user-arrow--open' : ''}`}
                  width="12" 
                  height="8" 
                  viewBox="0 0 12 8" 
                  fill="none"
                >
                  <path 
                    d="M1 1.5L6 6.5L11 1.5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="header__dropdown">
                  <button 
                    className="header__dropdown-item"
                    onClick={handleProfileClick}
                  >
                    Мой профиль
                  </button>
                  <button 
                    className="header__dropdown-item"
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="btn btn--primary header__btn" 
              onClick={handleLoginClick}
              type="button"
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;





