import { get, patch } from './apiClient';
import { getWorkoutById } from './workoutsApi';

export const getUserProgress = async (courseId, workoutId) => {
  try {
    const result = await get(
      `/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`,
      { requiresAuth: true }
    );
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Не удалось загрузить прогресс',
    };
  }
};

export const saveProgress = async (courseId, workoutId, progressData) => {
  try {
    const result = await patch(
      `/courses/${courseId}/workouts/${workoutId}`,
      { progressData },
      { requiresAuth: true }
    );
    
    if (result.success) {
      return { success: true };
    }
    
    return {
      success: false,
      error: result.data?.message || 'Не удалось сохранить прогресс',
    };
  } catch (error) {
    let errorMessage = 'Не удалось сохранить прогресс';
    
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

export const resetProgress = async (courseId, workoutId) => {
  try {
    const result = await patch(
      `/courses/${courseId}/workouts/${workoutId}/reset`,
      null,
      { requiresAuth: true }
    );
    
    if (result.success) {
      return { success: true };
    }
    
    return {
      success: false,
      error: result.data?.message || 'Не удалось сбросить прогресс',
    };
  } catch (error) {
    let errorMessage = 'Не удалось сбросить прогресс';
    
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

export const calculateWorkoutProgress = (progressData, exercises) => {
  if (!progressData || !progressData.progressData || progressData.progressData.length === 0) {
    return 0;
  }

  if (progressData.workoutCompleted) {
    return 100;
  }

  const workoutProgress = progressData.progressData.reduce(
    (sum, val) => sum + (val || 0),
    0
  );
  const workoutTotal = exercises.reduce(
    (sum, ex) => sum + (ex.quantity || 0),
    0
  );

  if (workoutTotal === 0) {
    return 0;
  }

  return Math.min(100, Math.round((workoutProgress / workoutTotal) * 100));
};

export const calculateCourseProgress = async (
  courseId,
  getWorkoutsFn,
  getProgressFn
) => {
  try {
    const workoutsResult = await getWorkoutsFn(courseId);
    
    if (!workoutsResult.success || !workoutsResult.data || workoutsResult.data.length === 0) {
      return 0;
    }

    const workouts = workoutsResult.data;
    const progressPromises = workouts.map(async (workout) => {
      try {
        const [progressResult, workoutDetailResult] = await Promise.all([
          getProgressFn(courseId, workout._id),
          getWorkoutById(workout._id),
        ]);

        if (
          progressResult.success &&
          workoutDetailResult.success &&
          workoutDetailResult.data
        ) {
          return calculateWorkoutProgress(
            progressResult.data,
            workoutDetailResult.data.exercises || []
          );
        }
        return 0;
      } catch (error) {
        return 0;
      }
    });

    const workoutProgresses = await Promise.all(progressPromises);
    const totalProgress = workoutProgresses.reduce(
      (sum, progress) => sum + progress,
      0
    );
    
    return workouts.length > 0
      ? Math.round(totalProgress / workouts.length)
      : 0;
  } catch (error) {
    return 0;
  }
};

export default {
  getUserProgress,
  saveProgress,
  resetProgress,
  calculateWorkoutProgress,
  calculateCourseProgress,
};

