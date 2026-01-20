import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';

const Header = ({ onOpenAuth }) => {
  const { user, logout } = useAuth();

  const handleClick = () => {
    if (user) {
      logout();
      window.location.reload();
    } else {
      onOpenAuth();
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          <div className="header__logo-section">
            <Logo />
            <p className="header__subtitle">Онлайн-тренировки для занятий дома</p>
          </div>
          <button className="btn btn--primary header__btn" onClick={handleClick}>
            {user ? user.email : 'Войти'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

