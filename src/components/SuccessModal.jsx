import { useEffect } from 'react';

const SuccessModal = ({ isOpen, onClose, message = 'Ваш прогресс засчитан!' }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="success-modal success-modal--visible">
      <div className="success-modal__overlay" onClick={onClose}></div>
      <div className="success-modal__container">
        <div className="success-modal__content">
          <div className="success-modal__text">
            <p className="success-modal__text-line">Ваш прогресс</p>
            <p className="success-modal__text-line">засчитан!</p>
          </div>
          <div className="success-modal__icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#99D100"/>
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;

