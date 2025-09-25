import React, { useState } from 'react';
import './PinSection.css';

interface PinSectionProps {
  onChangePin?: (currentPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
}

const PinSection: React.FC<PinSectionProps> = ({ onChangePin }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClear = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setMessage(null);
    setMessageType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);
    if (newPin !== confirmPin) {
      setMessage('El PIN nuevo y la confirmación no coinciden.');
      setMessageType('error');
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setMessage('El PIN debe tener 4 dígitos.');
      setMessageType('error');
      return;
    }
    if (!onChangePin) return;
    setLoading(true);
    try {
      const result = await onChangePin(currentPin, newPin);
      if (result.success) {
        setMessage('PIN actualizado correctamente.');
        setMessageType('success');
        handleClear();
      } else {
        setMessage(result.error || 'Error al actualizar el PIN.');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Error inesperado.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pin-section-container">
      <div className="pin-header">
        <h2>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Cambiar PIN de Administrador
        </h2>
        <p className="pin-description">Actualiza el PIN de acceso al panel administrativo</p>
      </div>
      <div className="pin-form-container">
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="current-pin">PIN Actual:</label>
            <input
              type="password"
              id="current-pin"
              maxLength={4}
              pattern="\d{4}"
              placeholder="0000"
              className="pin-input"
              required
              value={currentPin}
              onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-pin">PIN Nuevo:</label>
            <input
              type="password"
              id="new-pin"
              maxLength={4}
              pattern="\d{4}"
              placeholder="0000"
              className="pin-input"
              required
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-pin">Confirmar PIN:</label>
            <input
              type="password"
              id="confirm-pin"
              maxLength={4}
              pattern="\d{4}"
              placeholder="0000"
              className="pin-input"
              required
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              autoComplete="off"
            />
          </div>
          {message && (
            <div className={`format-info ${messageType}`}>{message}</div>
          )}
          <div style={{ display: 'none' }}>
            {/* Botón oculto para compatibilidad */}
            <button type="button" id="reset-pin-form">Reset</button>
          </div>
          <div className="tab-actions">
            <button
              type="button"
              className="btn btn-secondary btn-large"
              onClick={handleClear}
              disabled={loading}
            >
              <span className="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </span>
              <span>Limpiar</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              <span className="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <span>Actualizar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinSection;
