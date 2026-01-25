import { useState, useEffect } from 'react';

const ProgressModal = ({ isOpen, onClose, exercises, currentProgress, onSave, workoutId, courseId }) => {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    if (isOpen && exercises) {
      const initialProgress = exercises.map((_, index) => {
        return currentProgress?.progressData?.[index] ?? 0;
      });
      setProgressData(initialProgress);
    }
  }, [isOpen, exercises, currentProgress]);

  const handleInputChange = (index, value) => {
    const newProgress = [...progressData];
    if (value === '' || value === null || value === undefined) {
      newProgress[index] = 0;
    } else {
      const cleanValue = value.toString().replace(/^0+/, '') || '0';
      const numValue = parseInt(cleanValue, 10);
      newProgress[index] = isNaN(numValue) ? 0 : numValue;
    }
    setProgressData(newProgress);
  };

  const handleSave = async () => {
    if (!exercises || exercises.length === 0) {
      alert('Нет упражнений для сохранения');
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

    if (onSave) {
      await onSave(validProgressData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="progress-modal progress-modal--visible">
      <div className="progress-modal__overlay" onClick={onClose}></div>
      <div className="progress-modal__container">
        <div className="progress-modal__header">
          <h2 className="progress-modal__title">Мой прогресс</h2>
          <button 
            className="progress-modal__close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="progress-modal__content">
          {exercises && exercises.length > 0 ? (
            <div className="progress-modal__exercises">
              {exercises.map((exercise, index) => (
                <div key={exercise._id || index} className="progress-modal__exercise">
                  <label className="progress-modal__exercise-label">
                    Сколько раз вы сделали {exercise.name?.toLowerCase() || `упражнение ${index + 1}`}?
                    {exercise.quantity && (
                      <span className="progress-modal__exercise-quantity">
                        (максимум: {exercise.quantity})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    className="progress-modal__exercise-input"
                    min="0"
                    max={exercise.quantity || 1000}
                    value={progressData[index] === 0 ? '' : (progressData[index] || '')}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '') {
                        handleInputChange(index, '');
                      } else {
                        const cleanValue = inputValue.replace(/^0+/, '') || '0';
                        handleInputChange(index, cleanValue);
                      }
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0' || e.target.value === '') {
                        e.target.select();
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="progress-modal__no-exercises">Упражнения не найдены</p>
          )}
        </div>
        <div className="progress-modal__actions">
          <button
            className="btn btn--secondary progress-modal__cancel-btn"
            onClick={onClose}
            type="button"
          >
            Отмена
          </button>
          <button
            className="btn btn--primary progress-modal__save-btn"
            onClick={handleSave}
            type="button"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;
