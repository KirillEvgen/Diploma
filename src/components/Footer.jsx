const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <button className="btn btn--primary footer__btn" onClick={scrollToTop}>
          Наверх ↑
        </button>
      </div>
    </footer>
  );
};

export default Footer;

