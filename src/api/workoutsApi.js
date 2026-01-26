/**
 * API методы для работы с тренировками
 */
import { get } from './apiClient';

/**
 * Получить тренировку по ID
 * @param {string} workoutId - ID тренировки
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const getWorkoutById = async (workoutId) => {
  try {
    const result = await get(`/workouts/${workoutId}`, {
      requiresAuth: true,
    });
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Не удалось загрузить тренировку',
    };
  }
};

/**
 * Получить все тренировки курса
 * @param {string} courseId - ID курса
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getCourseWorkouts = async (courseId) => {
  try {
    const result = await get(`/courses/${courseId}/workouts`, {
      requiresAuth: true,
    });
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Не удалось загрузить тренировки',
      data: [],
    };
  }
};

export default {
  getWorkoutById,
  getCourseWorkouts,
};


