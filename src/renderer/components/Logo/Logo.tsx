import React, { useState } from 'react';
import './Logo.css';

interface LogoProps {
  src: string;
  position: "derecha" | "centro" | "izquierda";
  alt?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  src,
  position,
  alt = 'Logo',
  className = ''
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    console.error('Error cargando logo:', src);
  };

  if (hasError) {
    return (
      <div className={`logo logo--${position} logo--error ${className}`}>
        <div className="logo__error-text">Logo</div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`logo logo--${position} ${className}`}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default Logo;