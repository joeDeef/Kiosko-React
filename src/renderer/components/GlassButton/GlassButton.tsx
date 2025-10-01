import React, { useState } from 'react';
import './GlassButton.css';

interface GlassButtonProps {
  key?: string;
  title: string;
  icon: string;
  onClick: () => void;
  index?: number;
  className?: string;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  icon,
  onClick,
  index = 0,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    onClick(); // <-- aquí llamas al handleButtonClick

    setTimeout(() => {
      setIsPressed(false);
    }, 150);
  };

  return (
    <div
      className={`glass-button ${isPressed ? 'glass-button--pressed' : ''} ${className}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={handleClick}
    >
      <div className="glass-button__icon">
        <img
          src={icon}
          alt={title}
          loading="lazy"
          onError={(e) => {
            // Fallback en caso de error de imagen
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="%23ffffff" viewBox="0 0 24 24"%3E%3Cpath d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/%3E%3C/svg%3E';
          }}
        />
      </div>
      <div className="glass-button__title">{title}</div>
    </div>
  );
};

export default GlassButton;