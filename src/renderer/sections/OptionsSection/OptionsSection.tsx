import { useAdminPanel } from '../../../shared/context/AdminPanelContext';
import { OptionsTable } from '../../components';
import { ButtonData } from '../../../shared/types';
import './OptionsSection.css';

interface OptionsSectionProps {
  buttons: ButtonData[];
}

const OptionsSection: React.FC<OptionsSectionProps> = ({ buttons }) => {
  const { updateData } = useAdminPanel();

  // Ordenar botones por orden
  const sortedButtons = [...buttons].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleAddOption = () => {
    if (buttons.length >= 6) {
      alert('Máximo 6 opciones permitidas');
      return;
    }

    const newOption: ButtonData = {
      id: `${Date.now()}`,
      order: buttons.length + 1,
      icon: 'fallback.png',
      title: 'Nueva Opción',
      videos: []
    };

    updateData(draft => {
      if (!draft.buttons) draft.buttons = [];
      draft.buttons.push(newOption);
    });
  };

  return (
    <div className="options-section">
      <h1>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
        Gestión de Opciones
      </h1>

      {/* Tabla de opciones */}
      <OptionsTable
        buttons={sortedButtons}
        maxOptions={6}
      />

      {/* Botón para agregar nueva opción */}
      {buttons.length < 6 && (
        <button
          className="btn btn-primary add-option-btn"
          onClick={handleAddOption}
        >
          <span style={{ marginRight: '8px' }}>➕</span>
          Añadir Nueva Opción
        </button>
      )}
    </div>
  );
};

export default OptionsSection;
