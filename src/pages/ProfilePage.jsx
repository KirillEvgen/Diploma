import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { programs, getProgramById } from '../data/programs';

const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

const ProfilePage = ({ onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [userCourses, setUserCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allApiCourses, setAllApiCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({}); 

  useEffect(() => {
    
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    
    if (!token || !email) {
      navigate('/');
      return;
    }

    const fetchCourseProgress = async (apiCourseId) => {
      try {
        const token = localStorage.getItem('token');
        
        const workoutsResponse = await fetch(`${API_BASE_URL}/courses/${apiCourseId}/workouts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!workoutsResponse.ok) {
          return 0;
        }

        const workouts = await workoutsResponse.json();
        if (!workouts || workouts.length === 0) {
          return 0;
        }

        const progressPromises = workouts.map(async (workout) => {
          try {
            const [progressResponse, workoutDetailResponse] = await Promise.all([
              fetch(
                `${API_BASE_URL}/users/me/progress?courseId=${apiCourseId}&workoutId=${workout._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              ),
              fetch(
                `${API_BASE_URL}/workouts/${workout._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              )
            ]);

            if (progressResponse.ok && workoutDetailResponse.ok) {
              const progressData = await progressResponse.json();
              const workoutDetail = await workoutDetailResponse.json();
              
              if (progressData.workoutCompleted) {
                return 100;
              } else if (progressData.progressData && progressData.progressData.length > 0) {
                const workoutProgress = progressData.progressData.reduce((sum, val) => sum + (val || 0), 0);
                const exercises = workoutDetail.exercises || [];
                const workoutTotal = exercises.reduce((sum, ex) => sum + (ex.quantity || 0), 0);
                const workoutPercent = workoutTotal > 0 ? Math.min(100, Math.round((workoutProgress / workoutTotal) * 100)) : 0;
                return workoutPercent;
              }
            }
            return 0;
          } catch (error) {
            return 0;
          }
        });

        const workoutProgresses = await Promise.all(progressPromises);
        const totalProgress = workoutProgresses.reduce((sum, progress) => sum + progress, 0);
        const averageProgress = workouts.length > 0 ? Math.round(totalProgress / workouts.length) : 0;
        return averageProgress;
      } catch (error) {
        return 0;
      }
    };

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const savedCourseIds = localStorage.getItem('userCourses');
        if (!savedCourseIds) {
          setUserCourses([]);
          setLoading(false);
          return;
        }

        try {
          const courseIds = JSON.parse(savedCourseIds);
          const allCoursesResponse = await fetch(`${API_BASE_URL}/courses`);
          if (allCoursesResponse.ok) {
            const allCourses = await allCoursesResponse.json();
            setAllApiCourses(allCourses);
            
            const userCoursesData = allCourses.filter(course => 
              courseIds.includes(course._id)
            );
            setUserCourses(userCoursesData);
            
            const progressPromises = userCoursesData.map(async (course) => {
              const progress = await fetchCourseProgress(course._id);
              return { courseId: course._id, progress };
            });
            
            const progressResults = await Promise.all(progressPromises);
            const progressMap = {};
            progressResults.forEach(({ courseId, progress }) => {
              progressMap[courseId] = progress;
            });
            setCourseProgress(progressMap);
          } else {
            setUserCourses(courseIds.map(id => ({ _id: id })));
          }
        } catch (e) {
          setUserCourses([]);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот курс?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/users/me/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        
        
        const updatedCourses = userCourses.filter(course => {
          const courseIdToCheck = course._id || course.id || course.courseId;
          return courseIdToCheck !== courseId;
        });
        setUserCourses(updatedCourses);
        
        const courseIds = updatedCourses.map(c => c._id || c.id || c.courseId);
        localStorage.setItem('userCourses', JSON.stringify(courseIds));
      } else {
        alert('Не удалось удалить курс. Попробуйте еще раз.');
      }
    } catch (error) {
      alert('Произошла ошибка. Попробуйте еще раз.');
    }
  };

  const handleCourseAction = async (courseId, progress) => {
    
    const localProgram = getProgramById(courseId);
    if (!localProgram) {
      navigate(`/course/${courseId}`);
      return;
    }

    
    let apiCourseId = null;
    
    
    const userCourse = userCourses.find(c => {
      if (typeof c === 'object' && c._id) {
        return c.nameRU === localProgram.title || c.nameEN?.toLowerCase() === localProgram.title?.toLowerCase();
      }
      return false;
    });
    
    if (userCourse && userCourse._id) {
      apiCourseId = userCourse._id;
    } else {
      
      const apiCourse = allApiCourses.find(c => 
        c.nameRU === localProgram.title || c.nameEN?.toLowerCase() === localProgram.title?.toLowerCase()
      );
      if (apiCourse && apiCourse._id) {
        apiCourseId = apiCourse._id;
      }
    }

    if (!apiCourseId) {
      
      navigate(`/course/${courseId}`);
      return;
    }

    if (progress === 100) {
      try {
        const token = localStorage.getItem('token');
        
        const workoutsResponse = await fetch(`${API_BASE_URL}/courses/${apiCourseId}/workouts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (workoutsResponse.ok) {
          const workouts = await workoutsResponse.json();
          
          for (const workout of workouts) {
            try {
              await fetch(`${API_BASE_URL}/courses/${apiCourseId}/workouts/${workout._id}/reset`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
            } catch (error) {
            }
          }
          
          const updatedProgress = await fetchCourseProgress(apiCourseId);
          setCourseProgress(prev => ({
            ...prev,
            [apiCourseId]: updatedProgress
          }));
        }
      } catch (error) {
      }
    }

    try {
      const token = localStorage.getItem('token');
      
      
      const response = await fetch(`${API_BASE_URL}/courses/${apiCourseId}/workouts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const workouts = await response.json();
        if (workouts && workouts.length > 0) {
          
          const firstWorkout = workouts[0];
          navigate(`/course/${courseId}/workout/${firstWorkout._id}`);
        } else {
          
          navigate(`/course/${courseId}`);
        }
      } else {
        
        navigate(`/course/${courseId}`);
      }
    } catch (error) {
      navigate(`/course/${courseId}`);
    }
  };

  const getCourseButtonText = (progress) => {
    if (progress === 0) {
      return 'Начать тренировки';
    } else if (progress === 100) {
      return 'Начать заново';
    } else {
      return 'Продолжить';
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <>
        <Header onOpenAuth={onOpenAuth} />
        <main className="main">
          <div className="container">
            <div className="profile-page__loading">Загрузка...</div>
          </div>
        </main>
      </>
    );
  }

  
  const userName = userData?.name || userData?.username || user?.email?.split('@')[0]?.split('.')[0] || 'Пользователь';
  const userLogin = userData?.login || userData?.username || user?.email || '';

  return (
    <>
      <Header onOpenAuth={onOpenAuth} />
      <main className="main">
        <div className="container">
          <div className="profile-page">
            <div className="profile-page__section">
              <h2 className="profile-page__section-title">Профиль</h2>
              <div className="profile-page__profile-card">
                <div className="profile-page__profile-content">
                  <div className="profile-page__avatar">
                    <img 
                      src="/images/svg/profile-icon.svg" 
                      alt="Профиль"
                      className="profile-page__avatar-img"
                    />
                  </div>
                  <div className="profile-page__profile-info">
                    <div className="profile-page__profile-header">
                      <h3 className="profile-page__name">{userName}</h3>
                      <p className="profile-page__login">Логин: {userLogin}</p>
                    </div>
                    <button 
                      className="btn btn--secondary profile-page__logout-btn"
                      onClick={handleLogout}
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-page__section">
              <h2 className="profile-page__section-title">Мои курсы</h2>
              <div className="profile-page__courses-list">
                {userCourses.length === 0 ? (
                  <p className="profile-page__empty">У вас пока нет добавленных курсов</p>
                ) : (
                  <>
                    {userCourses.map((course) => {
                    
                    
                    const courseId = course._id || course.id || course.courseId;
                    let program = null;
                    
                    
                    if (course.nameRU) {
                      program = programs.find(p => p.title === course.nameRU);
                    }
                    
                    
                    if (!program && courseId) {
                      const numericId = parseInt(courseId);
                      if (!isNaN(numericId)) {
                        program = getProgramById(numericId);
                      }
                    }
                    
                    if (!program) {
                      return null;
                    }

                    const progress = courseProgress[courseId] ?? 0;

                    return (
                      <div key={courseId} className="profile-page__course-card">
                        <button
                          className="profile-page__delete-btn"
                          onClick={() => handleDeleteCourse(courseId)}
                          title="Удалить курс"
                          style={{ color: program.bgColor }}
                        >
                          <img 
                            src="/images/svg/remove-in-circle.svg" 
                            alt="Удалить"
                            className="profile-page__delete-icon"
                          />
                        </button>
                        <div className="profile-page__course-image">
                          <img 
                            src={program.image} 
                            alt={program.title}
                            className="profile-page__course-img"
                          />
                        </div>
                        <div className="profile-page__course-content">
                          <h3 className="profile-page__course-title">{program.title}</h3>
                          <div className="profile-page__course-meta">
                            <div className="profile-page__meta-item">
                              <img 
                                src="/images/svg/kalendar.svg" 
                                alt=""
                                className="profile-page__meta-icon"
                              />
                              <span>{program.duration}</span>
                            </div>
                            <div className="profile-page__meta-item">
                              <img 
                                src="/images/svg/time.svg" 
                                alt=""
                                className="profile-page__meta-icon"
                              />
                              <span>{program.timePerDay}</span>
                            </div>
                            <div className="profile-page__meta-item">
                              <img 
                                src="/images/svg/signal.svg" 
                                alt=""
                                className="profile-page__meta-icon"
                              />
                              <span>{program.difficulty}</span>
                            </div>
                          </div>
                          <div className="profile-page__course-progress">
                            <div className="profile-page__progress-header">
                              <span className="profile-page__progress-text">Прогресс {progress}%</span>
                              <div className="profile-page__progress-bar">
                                <div 
                                  className="profile-page__progress-fill"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                                 <button
                                   className="btn btn--primary profile-page__course-action-btn"
                                   onClick={() => {
                                     
                                     const localProgramId = program.id;
                                     handleCourseAction(localProgramId, progress);
                                   }}
                                 >
                                   {getCourseButtonText(progress)}
                                 </button>
                        </div>
                      </div>
                    );
                  })}
                    <button 
                      className="btn btn--primary profile-page__scroll-top-btn" 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Наверх ↑
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;

