import { useParams } from 'react-router-dom';
import { getProgramById } from '../data/programs';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

const CoursePage = ({ onOpenAuth }) => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiCourseId, setApiCourseId] = useState(null);

  const program = getProgramById(id);

  
  useEffect(() => {
    const fetchApiCourseId = async () => {
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

  useEffect(() => {
    
    
    if (!isAuthenticated) {
      setLoading(false);
      setUserCourses([]);
      return;
    }

    try {
      const savedCourses = localStorage.getItem('userCourses');
      if (savedCourses) {
        const courseIds = JSON.parse(savedCourses);
        setUserCourses(courseIds);
      } else {
        setUserCourses([]);
      }
    } catch (error) {
      setUserCourses([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!program) {
    return (
      <>
        <Header onOpenAuth={onOpenAuth} />
        <main className="main">
          <div className="container">
            <h1>Курс не найден</h1>
          </div>
        </main>
      </>
    );
  }

  
  const hasCourse = apiCourseId ? userCourses.includes(apiCourseId) : false;

  const handleAddCourse = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (!apiCourseId) {
      alert('Не удалось найти курс в системе. Попробуйте обновить страницу.');
      return;
    }

    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      
      
      const requestBody = { courseId: apiCourseId };
      
      const response = await fetch(`${API_BASE_URL}/users/me/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        
        
        const updatedCourses = [...userCourses, apiCourseId];
        setUserCourses(updatedCourses);
        localStorage.setItem('userCourses', JSON.stringify(updatedCourses));
        alert('Курс успешно добавлен!');
      } else {
        let errorMessage = 'Не удалось добавить курс. Попробуйте еще раз.';
        let courseAlreadyAdded = false;
        
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
              
              if (errorData.message.includes('уже') || errorData.message.includes('добавлен')) {
                courseAlreadyAdded = true;
              }
            }
          } catch (e) {
            if (errorText) {
              errorMessage = errorText;
              if (errorText.includes('уже') || errorText.includes('добавлен')) {
                courseAlreadyAdded = true;
              }
            }
          }
        } catch (e) {
        }
        
        if (courseAlreadyAdded || response.status === 500) {
          if (!userCourses.includes(apiCourseId)) {
            const updatedCourses = [...userCourses, apiCourseId];
            setUserCourses(updatedCourses);
            localStorage.setItem('userCourses', JSON.stringify(updatedCourses));
          }
          alert('Курс уже был добавлен!');
        } else {
          if (response.status === 405) {
            errorMessage = 'Метод не поддерживается.';
          } else if (response.status === 400) {
            errorMessage = 'Некорректный запрос.';
          } else if (response.status === 401) {
            errorMessage = 'Необходима авторизация. Войдите в систему.';
          } else if (response.status === 404) {
            errorMessage = 'Курс не найден.';
          }
          alert(errorMessage);
        }
      }
    } catch (error) {
      alert('Произошла ошибка при добавлении курса. Проверьте подключение к интернету и попробуйте еще раз.');
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <>
      <Header onOpenAuth={onOpenAuth} />
      <main className="main">
        <div className="course-page">
          <div className="container">
            <div className="course-page__header">
              <div 
                className="course-page__image-wrapper"
                style={{ backgroundColor: program.bgColor }}
              >
                <img 
                  src={program.detailImage || program.image} 
                  alt={program.title}
                  className="course-page__image course-page__image--desktop"
                />
                <img 
                  src={program.image} 
                  alt={program.title}
                  className="course-page__image course-page__image--mobile"
                />
              </div>
            </div>

            <div className="course-page__content">
              <div className="course-page__section">
                <h2 className="course-page__section-title">Подойдет для вас, если:</h2>
                <div className="course-page__suitable-list">
                  {program.suitableFor.map((item, index) => (
                    <div key={index} className="course-page__suitable-card">
                      <div className="course-page__suitable-card-inner">
                        <div className="course-page__suitable-number">{index + 1}</div>
                        <p className="course-page__suitable-text">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="course-page__section">
                <h2 className="course-page__section-title">Направления</h2>
                <div className="course-page__directions">
                  <div className="course-page__directions-column">
                    {program.directions.slice(0, 2).map((direction, index) => (
                      <div key={index} className="course-page__direction-item">
                        <img 
                          src="/images/svg/star.svg" 
                          alt=""
                          className="course-page__direction-icon"
                        />
                        <span>{direction}</span>
                      </div>
                    ))}
                  </div>
                  <div className="course-page__directions-column">
                    {program.directions.slice(2, 4).map((direction, index) => (
                      <div key={index + 2} className="course-page__direction-item">
                        <img 
                          src="/images/svg/star.svg" 
                          alt=""
                          className="course-page__direction-icon"
                        />
                        <span>{direction}</span>
                      </div>
                    ))}
                  </div>
                  <div className="course-page__directions-column">
                    {program.directions.slice(4, 6).map((direction, index) => (
                      <div key={index + 4} className="course-page__direction-item">
                        <img 
                          src="/images/svg/star.svg" 
                          alt=""
                          className="course-page__direction-icon"
                        />
                        <span>{direction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="course-page__cta-wrapper">
              <div className="course-page__cta-image">
                <img 
                  src="/images/svg/greenline.svg" 
                  alt=""
                  className="course-page__cta-decoration"
                />
                <img 
                  src="/images/svg/blackline.svg" 
                  alt=""
                  className="course-page__cta-blackline"
                />
                <img 
                  src="/images/svg/man.png" 
                  alt="Тренировка"
                  className="course-page__cta-img"
                />
              </div>
              <div className="course-page__cta">
                <div className="course-page__cta-content">
                  <div className="course-page__cta-text">
                    <h2 className="course-page__cta-title">
                      Начните путь<br />к новому телу
                    </h2>
                    <ul className="course-page__benefits">
                      {program.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                    <button 
                      className="btn btn--primary course-page__cta-btn"
                      onClick={handleAddCourse}
                      disabled={isAdding || hasCourse}
                    >
                      {isAdding 
                        ? 'Добавление...' 
                        : hasCourse 
                          ? 'Курс уже добавлен' 
                          : isAuthenticated 
                            ? 'Добавить курс' 
                            : 'Войдите, чтобы добавить курс'
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CoursePage;

