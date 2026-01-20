import { useState, useEffect } from 'react';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setError('');
      setEmail('');
      setPassword('');
      setPasswordConfirm('');
      setIsLogin(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Введите корректное электронное письмо');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      onClose();
      window.location.reload();
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Пароли не совпадают.');
      return;
    }

    setLoading(true);
    const result = await register(email, password);
    setLoading(false);

    if (result.success) {
      alert('Регистрация прошла успешно! Теперь войдите в систему.');
      setIsLogin(true);
      setPassword('');
      setPasswordConfirm('');
      setError('');
    } else {
      setError(result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal auth-modal--visible">
      <div className="auth-modal__overlay" onClick={onClose}></div>
      <div className="auth-modal__container">
        <div className="auth-logo">
          <Logo />
        </div>

        {isLogin ? (
          <form className="auth-form auth-form--login" onSubmit={handleLogin}>
            <div className="auth-form__fields">
              <div className="auth-form__field">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-form__input"
                  placeholder="Эл. почта"
                  required
                />
              </div>
              <div className="auth-form__field">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-form__input"
                  placeholder="Пароль"
                  required
                />
                {error && <p className="auth-form__error auth-form__error--visible">{error}</p>}
              </div>
            </div>
            <div className="auth-form__actions">
              <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--full"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Зарегистрироваться
              </button>
            </div>
          </form>
        ) : (
          <form className="auth-form auth-form--register" onSubmit={handleRegister}>
            <div className="auth-form__fields">
              <div className="auth-form__field">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-form__input"
                  placeholder="Эл. почта"
                  required
                />
              </div>
              <div className="auth-form__field">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-form__input"
                  placeholder="Пароль"
                  required
                />
              </div>
              <div className="auth-form__field">
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="auth-form__input"
                  placeholder="Повторите пароль"
                  required
                />
                {error && <p className="auth-form__error auth-form__error--visible">{error}</p>}
              </div>
            </div>
            <div className="auth-form__actions">
              <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--full"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                Войти
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

