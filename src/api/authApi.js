/**
 * API методы для авторизации
 */
import { post } from './apiClient';

const ERROR_MESSAGES = {
  loginIncorrect: 'Пароль введен неверно, попробуйте еще раз.',
  emailExists: 'Данная почта уже используется. Попробуйте войти.',
};

/**
 * Вход в систему
 * @param {string} email - Email пользователя
 * @param {string} password - Пароль
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export const login = async (email, password) => {
  try {
    const result = await post('/auth/login', { email, password });
    
    if (result.success && result.data?.token) {
      // Сохраняем токен и email
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('email', email);
      
      return {
        success: true,
        token: result.data.token,
      };
    }
    
    return {
      success: false,
      error: result.data?.message || ERROR_MESSAGES.loginIncorrect,
    };
  } catch (error) {
    // Обработка специфичных ошибок авторизации
    let errorMessage = ERROR_MESSAGES.loginIncorrect;
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.data?.message) {
      errorMessage = error.data.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Регистрация нового пользователя
 * @param {string} email - Email пользователя
 * @param {string} password - Пароль
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const register = async (email, password) => {
  try {
    const result = await post('/auth/register', { email, password });
    
    if (result.success) {
      return { success: true };
    }
    
    return {
      success: false,
      error: result.data?.message || ERROR_MESSAGES.emailExists,
    };
  } catch (error) {
    let errorMessage = ERROR_MESSAGES.emailExists;
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.data?.message) {
      errorMessage = error.data.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

export default {
  login,
  register,
};

