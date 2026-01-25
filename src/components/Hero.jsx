const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero__content">
          <h1 className="hero__title">
            Начните заниматься спортом<br />и улучшите качество жизни
          </h1>
          <div className="hero__badge">
            <p className="hero__badge-text">
              Измени своё<br />тело за полгода!
            </p>
            <img 
              src="/images/icons/badge-arrow.png" 
              alt="" 
              className="hero__badge-arrow" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;





