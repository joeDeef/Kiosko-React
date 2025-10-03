import React, { useState, useRef, useEffect } from 'react';
import { useAssetPath } from '../../hooks';
import { ButtonData } from '../../../shared/types';
import { useAdminPanel } from '../../../shared/context/AdminPanelContext';
import { ImageCropModal, VideoEditorModal } from '../index';
import './OptionEditor.css';

interface OptionEditorProps {
  button: ButtonData;
  closeOpenEditor: () => void;
}

const OptionEditor: React.FC<OptionEditorProps> = ({
  button,
  closeOpenEditor
}) => {
  const [editedButton, setEditedButton] = useState<ButtonData>({ ...button });
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { img, temp } = useAssetPath();
  const { updateData, addImageToDelete, removeImageToDelete } = useAdminPanel();
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  useEffect(() => {
    const initialImage = button.temporalImage || button.icon || '';
    setPreviewImage(initialImage);
  }, [button]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedButton(prev => ({ ...prev, title: e.target.value }));
  };

  const handleImageSelect = async (file: File) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG o WEBP)');
      return;
    }

    const buffer = await file.arrayBuffer();
    const ext = file.name.split('.').pop() || 'png';
    const temporalImageUrl = await window.electronAPI.saveTempImage(buffer, ext, `option`);

    setEditedButton(prev => ({ ...prev, temporalImage: temporalImageUrl }));
    setPreviewImage(temporalImageUrl);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width !== img.height) {
        // abrir modal de recorte
        setTempFile(file);
        setCropModalOpen(true);
      } else {
        // ya es cuadrada, sigue el flujo normal
        handleImageSelect(file);
      }
    };
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    // Convertir base64 a File/Blob
    const res = await fetch(croppedDataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'cropped.png', { type: 'image/png' });

    handleImageSelect(file);
    setCropModalOpen(false);
  };


  const handleSave = () => {
    if (!editedButton.title.trim()) {
      alert('El título no puede estar vacío');
      return;
    }

    updateData(draft => {
      const index = draft.buttons.findIndex(b => b.id === editedButton.id);
      if (index >= 0) {
        draft.buttons[index] = editedButton;
      } else {
        draft.buttons.push(editedButton);
      }
    });
    addImageToDelete(button.icon);
    closeOpenEditor();
  };

  const handleCancel = async () => {
    // Eliminar la imagen temp si se agrego
    if (editedButton.temporalImage) {
      await window.electronAPI.removeTempFile(editedButton.temporalImage);
    }
    // cerrar el editor
    closeOpenEditor();
  };

  const onOpenVideoEditor = async () => {
    setVideoModalOpen(true);
  }

  const getCurrentImageSrc = () => {
    if (editedButton.temporalImage) {
      return temp(editedButton.temporalImage);
    }
    if (editedButton.icon) {
      return img(editedButton.icon);
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="%23666" viewBox="0 0 24 24"%3E%3Cpath d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/%3E%3C/svg%3E';
  };

  const handleSaveVideos = (newVideos: string[], videosToDelete: string[]) => {
    setEditedButton(prev => ({
      ...prev,
      videos: newVideos
    }));
    // aquí puedes guardar en tu backend los videos a eliminar
    console.log("Videos eliminados:", videosToDelete);
    setVideoModalOpen(false);
  };
  
  return (
    <div className="option-details show">
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Editar Opción
      </h2>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="edit-flex-row">
          <div className="edit-left">
            <div className="form-group">
              <label htmlFor="option-title">Título:</label>
              <input
                id="option-title"
                type="text"
                value={editedButton.title}
                onChange={handleTitleChange}
                placeholder="Ingresa el título de la opción"
                maxLength={50}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="option-image">Elegir Imagen:</label>
              <p className="format-info">Solo se aceptan archivos: PNG, JPG, JPEG, WEBP</p>
              <input
                ref={fileInputRef}
                id="option-image"
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/webp"
                onChange={handleFileInputChange}
              />
            </div>
          </div>
          <div className="edit-right">
            <div className="preview-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Previsualización
            </div>
            <div className="preview-circle-container">
              <div className="preview-glass-button">
                <div className="icon-container">
                  <img src={getCurrentImageSrc()} alt={editedButton.title} />
                </div>
                <div className="title">{editedButton.title || 'Título'}</div>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-videos"
          onClick={onOpenVideoEditor}
          style={{ margin: '24px auto 0', display: 'block' }}
        >
          Revisar Videos Informativos{typeof editedButton.videos?.length === 'number' ? ` (${editedButton.videos.length})` : ''}
        </button>
        <div className="form-buttons form-buttons-centered">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSave}
          >
            Aceptar
          </button>
        </div>
      </form>
      {cropModalOpen && tempFile && (
        <ImageCropModal
          imageSrc={URL.createObjectURL(tempFile)}
          onClose={() => setCropModalOpen(false)}
          onCrop={handleCropComplete}
        />
      )}

      {videoModalOpen && (
        <VideoEditorModal
          videos={editedButton.videos || []}
          onClose={() => setVideoModalOpen(false)}
          onSave={handleSaveVideos}
        />
      )}

    </div>
  );
};

export default OptionEditor;