import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

const ERROR_MESSAGES = {
  loginIncorrect: 'Пароль введен неверно, попробуйте еще раз.',
  emailExists: 'Данная почта уже используется. Попробуйте войти.',
  generic: 'Произошла ошибка. Попробуйте еще раз.'
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (token && email) {
      setUser({ email, token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const url = `${API_BASE_URL}/auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      let data = null;
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            data = { message: responseText || ERROR_MESSAGES.generic };
          }
        }
      } catch (parseError) {
        data = { message: ERROR_MESSAGES.generic };
      }

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        localStorage.setItem('email', email);
        setUser({ email, token: data.token });
        return { success: true };
      } else {
        let errorMessage = ERROR_MESSAGES.loginIncorrect;
        if (data && data.message) {
          errorMessage = data.message;
        } else if (data && data.error) {
          errorMessage = data.error;
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      return { success: false, error: ERROR_MESSAGES.generic };
    }
  };

  const register = async (email, password) => {
    try {
      const url = `${API_BASE_URL}/auth/register`;
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      let responseText = '';
      let data = null;

      try {
        responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            data = { message: responseText || ERROR_MESSAGES.generic };
          }
        }
      } catch (parseError) {
        data = { message: ERROR_MESSAGES.generic };
      }

      if (response.status === 405 || response.status === 404) {
        let errorMsg = `Ошибка ${response.status}: Сервер не может обработать запрос. `;
        if (response.status === 405) {
          errorMsg += 'Метод не разрешен. ';
        } else if (response.status === 404) {
          errorMsg += 'Эндпоинт не найден. ';
        }
        errorMsg += `Проверьте правильность URL эндпоинта API или обратитесь к документации.`;
        return { success: false, error: errorMsg };
      }

      if (response.ok) {
        return { success: true };
      } else {
        let errorMessage = ERROR_MESSAGES.generic;
        if (data && data.message) {
          errorMessage = data.message;
        } else if (data && data.error) {
          errorMessage = data.error;
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      return { success: false, error: ERROR_MESSAGES.generic };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
};


