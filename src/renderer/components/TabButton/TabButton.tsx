import React from 'react';
import './TabButton.css';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
  className?: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  icon,
  text,
  className = ''
}) => {
  return (
    <button
      className={`tab-btn ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
    >
      <span className="tab-icon">
        {icon}
      </span>
      <span className="tab-text">{text}</span>
    </button>
  );
};

export default TabButton;