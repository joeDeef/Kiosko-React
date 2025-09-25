import React from 'react';
import './ActionButton.css';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled && !loading) {
      onClick();
    }
  };

  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer'
      }}
    >
      <span className="btn-icon">
        {loading ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        ) : icon}
      </span>
      <span>{children}</span>
    </button>
  );
};

export default ActionButton;