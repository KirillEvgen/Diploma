const ProgramCard = ({ program }) => {
  return (
    <article className="program-card">
      <div 
        className="program-card__image" 
        style={{ backgroundColor: program.bgColor }}
      >
        <button 
          className="program-card__add-btn" 
          aria-label="Добавить в избранное"
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
              <svg 
                className="program-card__detail-icon" 
                width="18" 
                height="18" 
                viewBox="0 0 18 18" 
                fill="none"
              >
                <path 
                  d="M13.5 2.25H4.5C3.67157 2.25 3 2.92157 3 3.75V13.5C3 14.3284 3.67157 15 4.5 15H13.5C14.3284 15 15 14.3284 15 13.5V3.75C15 2.92157 14.3284 2.25 13.5 2.25Z" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                />
                <path 
                  d="M3.375 6.75H14.625M6.75 3.375V6.75M10.125 3.375V6.75" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                />
              </svg>
              <span>{program.duration}</span>
            </div>
            <div className="program-card__detail-item">
              <svg 
                className="program-card__detail-icon" 
                width="18" 
                height="18" 
                viewBox="0 0 18 18" 
                fill="none"
              >
                <circle 
                  cx="9" 
                  cy="9" 
                  r="7.3125" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                />
                <path 
                  d="M9 4.5V9L11.25 11.25" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
              </svg>
              <span>{program.timePerDay}</span>
            </div>
          </div>
          <div className="program-card__detail-row">
            <div className="program-card__detail-item">
              <svg 
                className="program-card__detail-icon" 
                width="18" 
                height="18" 
                viewBox="0 0 18 18" 
                fill="none"
              >
                <path 
                  d="M2.25 13.5L6.75 9L10.125 12.375L15.75 6.75" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M15.75 6.75H11.25V11.25" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span>{program.difficulty}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProgramCard;

