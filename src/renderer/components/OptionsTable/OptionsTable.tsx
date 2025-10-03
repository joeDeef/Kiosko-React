import { useState, useRef } from 'react';
import { OptionEditor } from '../index';
import { useAssetPath } from '../../hooks';
import { ButtonData } from '../../../shared/types';
import { useAdminPanel } from '../../../shared/context/AdminPanelContext';
import './OptionsTable.css';

interface OptionsTableProps {
  buttons: ButtonData[];
  maxOptions?: number;
}

const OptionsTable: React.FC<OptionsTableProps> = ({ buttons, maxOptions = 6 }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const { img, temp } = useAssetPath();
  const { updateData } = useAdminPanel();

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    const row = e.currentTarget as HTMLTableRowElement;
    row.style.opacity = '0.5';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newButtons = [...buttons];
    const draggedButton = newButtons[draggedIndex];
    newButtons.splice(draggedIndex, 1);
    newButtons.splice(dropIndex, 0, draggedButton);

    // Actualizar orden
    const reordered = newButtons.map((btn, idx) => ({ ...btn, order: idx + 1 }));
    //onUpdateButtons(reordered);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDelete = (index: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta opción?')) return;

    // Aquí usamos updateData para modificar el estado global
    updateData(draft => {
      if (!draft.buttons) draft.buttons = [];
      draft.buttons.splice(index, 1); // elimina el botón
      // Reordenar el order
      draft.buttons = draft.buttons.map((btn: ButtonData, idx: number) => ({
        ...btn,
        order: idx + 1
      }));
    });
  };

  const getImageSrc = (button: ButtonData) => {
    if (button.temporalImage) return temp(button.temporalImage);
    if (button.icon) return img(button.icon);
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="%23666" viewBox="0 0 24 24"%3E%3Cpath d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/%3E%3C/svg%3E';
  };

  return (
    <div className="options-table-container">
      <table ref={tableRef} className="options-table">
        <thead>
          <tr>
            <th>Orden</th>
            <th>Opción</th>
            <th>Icono</th>
            <th>Videos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {buttons.map((button, index) => [
            <tr
              key={button.id}
              className={`draggable-row${draggedIndex === index ? ' dragging' : ''}${dragOverIndex === index ? ' drag-over' : ''}${editingIndex === index ? ' selected' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => setEditingIndex(editingIndex === index ? null : index)}
            >
              <td className="order-cell">
                <button className="move-btn" title="Arrastrar para reordenar" onClick={(e) => e.stopPropagation()}>⋮⋮</button>
                {button.order || index + 1}
              </td>
              <td>{button.title}</td>
              <td>
                <img src={getImageSrc(button)} alt={button.title} className="option-icon" />
              </td>
              <td>{button.videos?.length || 0}</td>
              <td>
                <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(index); }}>🗑️</button>
              </td>
            </tr>,
            editingIndex === index && (
              <tr key={button.id + '-editor'}>
                <td colSpan={5} style={{ padding: 0, background: 'transparent' }}>
                  <OptionEditor
                    button={button}
                    closeOpenEditor={() => setEditingIndex(null)}
                  />
                </td>
              </tr>
            )
          ])}
        </tbody>
      </table>

      {buttons.length === 0 && (
        <div className="empty-table">
          <p>No hay opciones configuradas</p>
        </div>
      )}
    </div>
  );
};

export default OptionsTable;
