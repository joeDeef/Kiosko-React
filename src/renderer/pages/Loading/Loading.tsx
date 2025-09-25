import React from 'react';
import './Loading.css';
import { useNavigate } from 'react-router-dom';
import { AdminPinModal } from '../../components';
import { useAssetPath } from '../../hooks';
import { useLoadingTimer } from '../../hooks/useLoadingTimer';
import './Loading.css';

const Loading: React.FC = () => {
  const navigate = useNavigate();
  const { img } = useAssetPath();

  const {
    imageOpacity,
    blinking,
    waitingForPin,
    handlePressStart,
    handlePressEnd,
    handleCancelPin,
  } = useLoadingTimer({ onFinish: () => navigate('/home') });

  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState(false);

  const handleConfirmPin = (pin: string) => {
    if (pin === '1234') {
      setMessage('✅ Acceso concedido');
      setError(false);
      setTimeout(() => navigate('/admin'), 500);
    } else {
      setMessage('❌ PIN incorrecto');
      setError(true);
    }
  };

  return (
    <div
      className="loading-screen"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
    >
      <img
        id="loading-img"
        src={img('smartSystemLogo_negativo.png')}
        alt="Cargando..."
        style={{
          opacity: imageOpacity,
          transition: 'opacity 0.5s ease-in-out',
          width: '80%',
          height: 'auto',
        }}
        className={blinking ? 'img-blink' : ''}
      />

      {waitingForPin && (
        <AdminPinModal
          onConfirm={handleConfirmPin}
          onCancel={handleCancelPin}
          message={message}
          error={error}
        />
      )}
    </div>
  );
};

export default Loading;
