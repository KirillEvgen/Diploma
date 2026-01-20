const Logo = ({ className = '' }) => {
  return (
    <div className={`logo ${className}`}>
      <div className="logo__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M8 5V19L19 12L8 5Z" fill="url(#playGradient)"/>
          <defs>
            <linearGradient id="playGradient" x1="8" y1="5" x2="19" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00C1FF"/>
              <stop offset="1" stopColor="#99D100"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="logo__text">SkyFitnessPro</span>
    </div>
  );
};

export default Logo;

