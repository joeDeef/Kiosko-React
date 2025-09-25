import './ActionsDropdown.css';
import React, { useState, useRef, useEffect } from 'react';

export interface DropdownAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void | Promise<void>;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionsDropdownProps {
  actions: DropdownAction[];
  label?: string;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({ actions, label = 'Acciones' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = async (action: DropdownAction) => {
    setIsOpen(false);
    if (!action.disabled) {
      try {
        await action.onClick();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error en acción '${action.label}':`, error);
      }
    }
  };

  return (
    <div className="actions-dropdown" ref={dropdownRef}>
      <button
        className={`dropdown-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{label}</span>
        <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
      <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
        {actions.map((action, idx) => (
          <button
            key={action.label + idx}
            className={`dropdown-item${action.danger ? ' danger' : ''}`}
            onClick={() => handleAction(action)}
            disabled={action.disabled}
          >
            {action.icon && <span className="icon">{action.icon}</span>}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionsDropdown;