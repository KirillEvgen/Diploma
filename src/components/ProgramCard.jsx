import { useNavigate } from 'react-router-dom';

const ProgramCard = ({ program }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/course/${program.id}`);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    navigate(`/course/${program.id}`);
  };

  return (
    <article className="program-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div 
        className="program-card__image" 
        style={{ backgroundColor: program.bgColor }}
      >
        <button 
          className="program-card__add-btn" 
          aria-label="Добавить в избранное"
          onClick={handleAddClick}
        >
          +
        </button>
        <img 
          src={program.image} 
          alt={program.title} 
          className="program-card__img" 
        />
      </div>
      <div className="program-card__info">
        <h3 className="program-card__title">{program.title}</h3>
        <div className="program-card__details">
          <div className="program-card__detail-row">
            <div className="program-card__detail-item">
              <img 
                src="/images/svg/kalendar.svg" 
                alt=""
                className="program-card__detail-icon"
              />
              <span>{program.duration}</span>
            </div>
            <div className="program-card__detail-item">
              <img 
                src="/images/svg/time.svg" 
                alt=""
                className="program-card__detail-icon"
              />
              <span>{program.timePerDay}</span>
            </div>
          </div>
          <div className="program-card__detail-row">
            <div className="program-card__detail-item">
              <img 
                src="/images/svg/signal.svg" 
                alt=""
                className="program-card__detail-icon"
              />
              <span>{program.difficulty}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProgramCard;



