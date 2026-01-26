/**
 * API методы для работы с курсами
 */
import { get, post, del } from './apiClient';

/**
 * Получить все доступные курсы
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getAllCourses = async (requireAuth = null) => {
  // Если requireAuth не указан, проверяем наличие токена
  if (requireAuth === null) {
    const token = localStorage.getItem('token');
    requireAuth = !!token;
  }

  try {
    const result = await get('/courses', { requiresAuth: requireAuth });
    return result;
  } catch (error) {
    // Если ошибка 400 или 401, и мы не использовали авторизацию, попробуем с ней
    if ((error.status === 400 || error.status === 401) && !requireAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        return getAllCourses(true);
      }
      return {
        success: false,
        error: 'Для получения списка курсов необходима авторизация',
        data: [],
      };
    }
    return {
      success: false,
      error: error.message || 'Не удалось загрузить курсы',
      data: [],
    };
  }
};

/**
 * Получить курс по ID
 * @param {string} courseId - ID курса
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const getCourseById = async (courseId) => {
  try {
    const result = await get(`/courses/${courseId}`);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Не удалось загрузить курс',
    };
  }
};

/**
 * Найти курс по названию (RU или EN)
 * @param {string} title - Название курса
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const findCourseByTitle = async (title) => {
  try {
    const result = await getAllCourses();
    
    if (!result.success) {
      // Если не удалось загрузить курсы, возвращаем ошибку
      return {
        success: false,
        error: result.error || 'Не удалось загрузить список курсов',
      };
    }
    
    if (!result.data || result.data.length === 0) {
      return {
        success: false,
        error: 'Список курсов пуст',
      };
    }
    
    const course = result.data.find(
      (c) =>
        c.nameRU === title ||
        c.nameEN?.toLowerCase() === title?.toLowerCase()
    );
    
    if (course) {
      return {
        success: true,
        data: course,
      };
    }
    
    return {
      success: false,
      error: 'Курс не найден',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Не удалось найти курс',
    };
  }
};

/**
 * Добавить курс пользователю
 * @param {string} courseId - ID курса
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const addUserCourse = async (courseId) => {
  try {
    const result = await post(
      '/users/me/courses',
      { courseId },
      { requiresAuth: true }
    );
    
    if (result.success) {
      return { success: true };
    }
    
    // Проверка на дубликат
    const errorMessage = result.data?.message || result.error || 'Не удалось добавить курс';
    const isDuplicate = 
      errorMessage.includes('уже') ||
      errorMessage.includes('добавлен') ||
      errorMessage.includes('already');
    
    return {
      success: isDuplicate, // Возвращаем success: true если это дубликат
      error: isDuplicate ? null : errorMessage,
      isDuplicate,
    };
  } catch (error) {
    // Обработка специфичных ошибок
    let errorMessage = 'Не удалось добавить курс. Попробуйте еще раз.';
    
    // Используем сообщение из ответа API, если оно есть
    if (error.data?.message) {
      errorMessage = error.data.message;
    } else if (error.message && !error.message.includes('Ошибка при обработке')) {
      errorMessage = error.message;
    } else if (error.status === 401) {
      errorMessage = 'Необходима авторизация. Войдите в систему.';
    } else if (error.status === 404) {
      errorMessage = 'Курс не найден.';
    } else if (error.status === 400) {
      errorMessage = error.data?.message || 'Некорректный запрос. Проверьте данные.';
    } else if (error.status === 500) {
      errorMessage = 'Ошибка сервера. Попробуйте позже или обратитесь в поддержку.';
    }
    
    // Проверка на дубликат из сообщения об ошибке
    const isDuplicate = 
      errorMessage.includes('уже') ||
      errorMessage.includes('добавлен') ||
      errorMessage.includes('already');
    
    return {
      success: isDuplicate,
      error: isDuplicate ? null : errorMessage,
      isDuplicate,
    };
  }
};

/**
 * Получить курсы пользователя
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getUserCourses = async () => {
  try {
    const result = await get('/users/me/courses', { requiresAuth: true });
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Не удалось загрузить ваши курсы',
      data: [],
    };
  }
};

/**
 * Удалить курс у пользователя
 * @param {string} courseId - ID курса
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const removeUserCourse = async (courseId) => {
  try {
    const result = await del(`/users/me/courses/${courseId}`, {
      requiresAuth: true,
    });
    
    if (result.success) {
      return { success: true };
    }
    
    return {
      success: false,
      error: result.data?.message || 'Не удалось удалить курс',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Не удалось удалить курс. Попробуйте еще раз.',
    };
  }
};

export default {
  getAllCourses,
  getCourseById,
  findCourseByTitle,
  addUserCourse,
  getUserCourses,
  removeUserCourse,
};

