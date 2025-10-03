import React, { useRef } from 'react';
import { Logo } from '../../components';
import { useAssetPath } from '../../hooks';
import { LogoData } from '../../../shared/types';
import { useAdminPanel } from '../../../shared/context/AdminPanelContext';
import './LogoSection.css';

interface LogoSectionProps {
  logoData: LogoData;
}

const LogoSection: React.FC<LogoSectionProps> = ({
  logoData
}) => {
  const { updateData, addImageToDelete, removeImageToDelete } = useAdminPanel();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { img, temp } = useAssetPath();

  const handlePositionChange = (position: 'izquierda' | 'centro' | 'derecha') => {
    updateData(draft => {
      draft.logo.position = position;
    });
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG o WEBP)');
      return;
    }

    const buffer = await file.arrayBuffer();              // Leer el buffer del archivo
    const ext = file.name.split('.').pop() || 'png';      // Obtener la extensión
    // Guardar en temp y obtener el nombre
    const savedFileName = await window.electronAPI.saveTempImage(buffer, ext);
    if (!savedFileName) {
      alert('No se pudo guardar la imagen.');
      return;
    }
    updateData(draft => {
      draft.logo.temporalImage = savedFileName;
    });
    addImageToDelete(logoData.image);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const resetToOriginal = async () => {
    if (logoData.temporalImage) {
      await window.electronAPI.removeTempFile(logoData.temporalImage);
      updateData(draft => {
        delete draft.logo.temporalImage;
      });
      removeImageToDelete(logoData.image);
    }
  };

  const getCurrentImageSrc = () => {
    if (logoData.temporalImage) {
      return temp(logoData.temporalImage);
    }
    return img(logoData.image);
  };

  const hasImage = !!(logoData.temporalImage || logoData.image);
  const isTemporalImage = !!logoData.temporalImage;

  return (
    <div className="container">
      <div className="main-content">
        {/* Sección del logo */}
        <div className="logo-section">
          <h2>Logo</h2>
          <div className="logo-display">
            <div className="logo-wrapper">
              {hasImage ? (
                <Logo
                  src={getCurrentImageSrc()}
                  position={"none"}
                  className={`logo-image ${isTemporalImage ? 'temporal-image' : ''}`}
                />
              ) : (
                <div className="empty-state" style={{ display: 'flex' }}>
                  <span>Sin imagen</span>
                </div>
              )}
            </div>

            <div className="position-selector">
              <label htmlFor="position">Posición en pantalla</label>
              <select
                id="position"
                value={logoData.position}
                onChange={(e) => handlePositionChange(e.target.value as any)}
              >
                <option value="izquierda">Izquierda</option>
                <option value="centro">Centro</option>
                <option value="derecha">Derecha</option>
              </select>
            </div>

            {/* Sección para cargar logo */}
            <div className="logo-upload-section">
              <label htmlFor="logo-upload" className="upload-label">
                Cargar nuevo logo:
              </label>
              <p className="format-info">Solo se aceptan archivos: PNG, JPG, JPEG, WEBP</p>

              <div
                className="upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <p>Haz clic aquí para seleccionar una imagen</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                id="logo-upload"
                accept="image/png,image/jpg,image/jpeg,image/webp"
                className="upload-input"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />

              {isTemporalImage && (
                <button
                  className="btn btn-secondary"
                  onClick={resetToOriginal}
                >
                  Restaurar original
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sección de previsualización */}
        <div className="preview-section">
          <h2>Previsualización</h2>
          <div className="preview-container">
            {hasImage ? (
              <Logo
                src={getCurrentImageSrc()}
                position={logoData.position}
                className="preview-logo"
              />
            ) : (
              <div className="preview-placeholder">
                <span>Vista previa del logo</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoSection;