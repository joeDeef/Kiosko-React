import React, { useState, useRef } from 'react';
import './OptionsTable.css';
import { OptionEditor } from '../index';
import { useAssetPath } from '../../hooks';

interface Button {
  title: string;
  icon: string;
  temporalImage?: string;
  order: number;
  videos?: string[];
}

interface OptionsTableProps {
  buttons: Button[];
  onEdit: (button: Button, index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (newOrder: Button[]) => void;
  maxOptions?: number;
}

const OptionsTable: React.FC<OptionsTableProps> = ({
  buttons,
  onEdit,
  onDelete,
  onReorder,
  maxOptions = 6
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const { img } = useAssetPath();

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    const row = e.currentTarget as HTMLTableRowElement;
    row.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const row = e.currentTarget as HTMLTableRowElement;
    row.style.opacity = '1';
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

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const newButtons = [...buttons];
    const draggedButton = newButtons[draggedIndex];
    
    // Remover el elemento arrastrado
    newButtons.splice(draggedIndex, 1);
    
    // Insertar en la nueva posición
    newButtons.splice(dropIndex, 0, draggedButton);
    
    // Llamar a la función de reordenamiento
    onReorder(newButtons);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getImageSrc = (button: Button): string => {
    if (button.temporalImage) {
      return img(button.temporalImage);
    }
    if (button.icon) {
      return img(button.icon);
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="%23666" viewBox="0 0 24 24"%3E%3Cpath d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/%3E%3C/svg%3E';
  };

  return (
    <div className="options-table-container">
      <table id="options-table" className="options-table" ref={tableRef}>
        <thead>
          <tr>
            <th>Orden</th>
            <th>Opción</th>
            <th>Icono</th>
            <th>Videos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="options-list">
          {buttons.map((button, index) => [
            <tr
              key={button.title + index}
              className={`draggable-row${draggedIndex === index ? ' dragging' : ''}${dragOverIndex === index ? ' drag-over' : ''}${editingIndex === index ? ' selected' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => setEditingIndex(editingIndex === index ? null : index)}
            >
              <td className="order-cell">
                <button 
                  className="move-btn"
                  title="Arrastrar para reordenar"
                  onClick={(e) => e.stopPropagation()}
                >
                  ⋮⋮
                </button>
                {button.order || index + 1}
              </td>
              <td className="title-cell">
                <span className="option-title">{button.title}</span>
              </td>
              <td className="icon-cell">
                <img 
                  className="option-icon" 
                  src={getImageSrc(button)} 
                  alt={button.title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="%23666" viewBox="0 0 24 24"%3E%3Cpath d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/%3E%3C/svg%3E';
                  }}
                />
                {button.temporalImage && (
                  <span className="temporal-indicator" title="Imagen temporal">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </span>
                )}
              </td>
              <td className="videos-cell">
                <div className="videos-info">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                  <span>{button.videos?.length || 0}</span>
                </div>
              </td>
              <td className="actions-cell">
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(index);
                  }}
                  title="Eliminar opción"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6M8,6V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              </td>
            </tr>,
            editingIndex === index && (
              <tr key={button.title + '-editor'}>
                <td colSpan={5} style={{ padding: 0, background: 'transparent' }}>
                  <OptionEditor
                    button={button}
                    onSave={(updated: Button) => {
                      onEdit(updated, index);
                      setEditingIndex(null);
                    }}
                    onCancel={() => setEditingIndex(null)}
                    onOpenVideoEditor={() => {}}
                  />
                </td>
              </tr>
            )
          ])}
        </tbody>
      </table>
      {buttons.length === 0 && (
        <div className="empty-table">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <path d="M9 9h6v6H9z"/>
          </svg>
          <p>No hay opciones configuradas</p>
          <p className="empty-subtitle">Haz clic en "Añadir Nueva Opción" para comenzar</p>
        </div>
      )}
    </div>
  );
};

export default OptionsTable;