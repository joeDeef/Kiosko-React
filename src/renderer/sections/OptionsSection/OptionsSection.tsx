import React, { useState } from 'react';
import './OptionsSection.css';
import { OptionsTable, OptionEditor } from '../../components';

interface Button {
  id: string;
  title: string;
  icon: string;
  temporalImage?: string;
  order: number;
  videos?: string[];
}

interface OptionsSectionProps {
  buttons: Button[];
  onButtonsUpdate: (buttons: Button[]) => void;
}

const OptionsSection: React.FC<OptionsSectionProps> = ({
  buttons,
  onButtonsUpdate
}) => {
  const [editingButton, setEditingButton] = useState<Button | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  // Ordenar botones por orden
  const sortedButtons = [...buttons].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleAddOption = () => {
    if (buttons.length >= 6) {
      alert('Máximo 6 opciones permitidas');
      return;
    }

    const newOption: Button = {
      id: `opcion${Date.now()}`,
      title: 'Nueva Opción',
      icon: '',
      order: buttons.length + 1,
      videos: []
    };

    const newButtons = [...buttons, newOption];
    onButtonsUpdate(newButtons);
    
    // Abrir editor para la nueva opción
    setEditingButton(newOption);
    setEditingIndex(newButtons.length - 1);
  };

  const handleEditOption = (button: Button, index: number) => {
    setEditingButton({ ...button }); // Crear copia para edición
    setEditingIndex(index);
  };

  const handleDeleteOption = (index: number) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar esta opción?');
    if (confirmed) {
      const newButtons = buttons.filter((_, i) => i !== index);
      // Reordenar los índices
      const reorderedButtons = newButtons.map((btn, idx) => ({
        ...btn,
        order: idx + 1
      }));
      onButtonsUpdate(reorderedButtons);
    }
  };

  const handleSaveOption = (updatedButton: Button) => {
    const newButtons = [...buttons];
    if (editingIndex >= 0 && editingIndex < newButtons.length) {
      newButtons[editingIndex] = updatedButton;
    } else {
      // Es una nueva opción
      newButtons.push(updatedButton);
    }
    onButtonsUpdate(newButtons);
    setEditingButton(null);
    setEditingIndex(-1);
  };

  const handleCancelEdit = () => {
    setEditingButton(null);
    setEditingIndex(-1);
  };

  const handleReorderOptions = (newOrder: Button[]) => {
    // Actualizar el orden de cada botón
    const reorderedButtons = newOrder.map((btn, index) => ({
      ...btn,
      order: index + 1
    }));
    onButtonsUpdate(reorderedButtons);
  };

  const handleOpenVideoEditor = (button: Button) => {
    // Aquí puedes implementar la lógica para abrir el editor de videos
    // similar a como estaba en el código original
    console.log('Abrir editor de videos para:', button.title);
    alert(`Editor de videos para "${button.title}" - ${button.videos?.length || 0} videos`);
  };

  return (
    <div className="options-section">
      <h1>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
        Gestión de Opciones
      </h1>

      {/* Tabla de opciones */}
      <OptionsTable
        buttons={sortedButtons}
        onEdit={handleEditOption}
        onDelete={handleDeleteOption}
        onReorder={handleReorderOptions}
        maxOptions={6}
      />

      {/* Botón para agregar nueva opción */}
      {buttons.length < 6 && (
        <button 
          className="btn btn-primary add-option-btn"
          onClick={handleAddOption}
        >
          <span style={{marginRight: '8px'}}>➕</span>
          Añadir Nueva Opción
        </button>
      )}

      {/* Editor de opciones */}
      {editingButton && (
        <OptionEditor
          button={editingButton}
          onSave={handleSaveOption}
          onCancel={handleCancelEdit}
          onOpenVideoEditor={() => handleOpenVideoEditor(editingButton)}
        />
      )}
    </div>
  );
};

export default OptionsSection;