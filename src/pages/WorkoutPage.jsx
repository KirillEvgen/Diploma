import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import ProgressModal from '../components/ProgressModal';
import SuccessModal from '../components/SuccessModal';
import { getProgramById } from '../data/programs';

const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

const WorkoutPage = ({ onOpenAuth }) => {
  const { courseId, workoutId } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiCourseId, setApiCourseId] = useState(null);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const program = getProgramById(courseId);

  useEffect(() => {
    const fetchApiCourseId = async () => {
      if (!program) return;
      try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        if (response.ok) {
          const courses = await response.json();
          const apiCourse = courses.find(course => 
            course.nameRU === program.title || 
            course.nameEN?.toLowerCase() === program.title?.toLowerCase()
          );
          if (apiCourse) {
            setApiCourseId(apiCourse._id);
          }
        }
      } catch (error) {
      }
    };

    if (program) {
      fetchApiCourseId();
    }
  }, [program]);

  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!workoutId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const workoutData = await response.json();
          setWorkout(workoutData);
          setExercises(workoutData.exercises || []);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  const fetchUserProgress = async () => {
    if (!apiCourseId || !workoutId) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/users/me/progress?courseId=${apiCourseId}&workoutId=${workoutId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const progressData = await response.json();
        setUserProgress(progressData);
      } else {
        setUserProgress(null);
      }
    } catch (error) {
      setUserProgress(null);
    }
  };

  useEffect(() => {
    if (apiCourseId && workoutId) {
      fetchUserProgress();
    }
  }, [apiCourseId, workoutId]);

  useEffect(() => {
    if (!authLoading) {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');
      if (!token || !email) {
        navigate('/');
        return;
      }
    }
  }, [authLoading, navigate]);

  if (authLoading) {
    return (
      <>
        <Header onOpenAuth={onOpenAuth} />
        <main className="main">
          <div className="container">
            <div className="workout-page__loading">Загрузка...</div>
          </div>
        </main>
      </>
    );
  }

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  if (!token || !email) {
    return null;
  }

  if (loading) {
    return (
      <>
        <Header onOpenAuth={onOpenAuth} />
        <main className="main">
          <div className="container">
            <div className="workout-page__loading">Загрузка...</div>
          </div>
        </main>
      </>
    );
  }

  if (!workout) {
    return (
      <>
        <Header onOpenAuth={onOpenAuth} />
        <main className="main">
          <div className="container">
            <div className="workout-page__error">Тренировка не найдена</div>
          </div>
        </main>
      </>
    );
  }

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(workout.video);

  const handleSaveProgress = async (progressData) => {
    if (!apiCourseId || !workoutId) {
      alert('Ошибка: не удалось определить курс или тренировку');
      return;
    }

    if (!exercises || exercises.length === 0) {
      alert('Ошибка: нет упражнений для сохранения прогресса');
      return;
    }

    if (progressData.length !== exercises.length) {
      alert(`Ошибка: количество значений прогресса (${progressData.length}) не совпадает с количеством упражнений (${exercises.length})`);
      return;
    }

    const validProgressData = progressData.map(val => {
      const num = parseInt(val);
      return isNaN(num) ? 0 : num;
    });

    try {
      const token = localStorage.getItem('token');
      const requestBody = { progressData: validProgressData };
      const response = await fetch(
        `${API_BASE_URL}/courses/${apiCourseId}/workouts/${workoutId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (response.ok) {
        await fetchUserProgress();
        setSuccessModalOpen(true);
      } else {
        let errorMessage = 'Не удалось сохранить прогресс';
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (e) {
        }
        alert(errorMessage);
      }
    } catch (error) {
      alert('Произошла ошибка при сохранении прогресса');
    }
  };

  const handleResetProgress = async () => {
    if (!apiCourseId || !workoutId) {
      alert('Ошибка: не удалось определить курс или тренировку');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить весь прогресс по этой тренировке?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/courses/${apiCourseId}/workouts/${workoutId}/reset`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        await fetchUserProgress();
        setSuccessModalOpen(true);
      } else {
        let errorMessage = 'Не удалось удалить прогресс';
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (e) {
        }
        alert(errorMessage);
      }
    } catch (error) {
      alert('Произошла ошибка при удалении прогресса');
    }
  };

  return (
    <>
      <Header onOpenAuth={onOpenAuth} />
      <main className="main">
        <div className="container">
          <div className="workout-page">
            <div className="workout-page__header">
              <h1 className="workout-page__title">{workout.name || 'Тренировка'}</h1>
            </div>

            <div className="workout-page__video-section">
              {videoId ? (
                <div className="workout-page__video-wrapper">
                  <iframe
                    className="workout-page__video"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={workout.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="workout-page__video-placeholder">
                  Видео недоступно
                </div>
              )}
            </div>

            <div className="workout-page__exercises-section">
              <h2 className="workout-page__exercises-title">
                Упражнения тренировки {workout.name?.match(/\d+/)?.[0] || ''}
              </h2>
              <div className="workout-page__exercises-list">
                {exercises.length === 0 ? (
                  <p className="workout-page__no-exercises">Упражнения пока не добавлены</p>
                ) : (
                  exercises.map((exercise, index) => {
                    const progressValue = userProgress?.progressData?.[index] ?? 0;
                    const quantity = exercise.quantity || 0;
                    const progressPercent = quantity > 0 
                      ? Math.min(100, Math.round((progressValue / quantity) * 100)) 
                      : 0;
                    
                    
                    return (
                      <div key={exercise._id || index} className="workout-page__exercise-item">
                        <div className="workout-page__exercise-header">
                          <span className="workout-page__exercise-name">
                            {exercise.name || `Упражнение ${index + 1}`}
                          </span>
                          <span className="workout-page__exercise-progress">
                            {progressPercent}%
                          </span>
                        </div>
                        <div className="workout-page__exercise-progress-bar">
                          <div 
                            className="workout-page__exercise-progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="workout-page__progress-actions">
                <button
                  className="btn btn--primary workout-page__progress-btn"
                  onClick={() => setProgressModalOpen(true)}
                >
                  Обновить свой прогресс
                </button>
                {userProgress && userProgress.progressData && userProgress.progressData.some(val => val > 0) && (
                  <button
                    className="btn btn--secondary workout-page__reset-btn"
                    onClick={handleResetProgress}
                  >
                    Сбросить прогресс
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <ProgressModal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        exercises={exercises}
        currentProgress={userProgress}
        onSave={handleSaveProgress}
        workoutId={workoutId}
        courseId={apiCourseId}
      />
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
      />
    </>
  );
};

export default WorkoutPage;
