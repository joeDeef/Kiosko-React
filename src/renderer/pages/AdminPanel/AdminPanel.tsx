import React, { useState, useEffect } from 'react';
import { LogoSection,VideosSection, OptionsSection, PinSection } from '../../sections';
import { ActionsDropdown, TabButton, ActionButton }  from '../../components';
import { AppData } from '../../../shared/types';
import { useData } from '../../hooks';
import './AdminPanel.css';

interface AdminPanelProps {
  initialData?: AppData;
  onDataChange?: (data: AppData) => void;
  onSave?: (data: AppData) => Promise<void>;
  onCancel?: () => Promise<void>;
  onImport?: () => Promise<void>;
  onExport?: () => Promise<void>;
  onRestart?: () => Promise<void>;
  onExit?: () => Promise<void>;
  onChangePin?: (currentPin: string, newPin: string) => Promise<{success: boolean, error?: string}>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  onDataChange,
  onSave,
  onCancel,
  onImport,
  onExport,
  onRestart,
  onExit,
  onChangePin
}) => {
  const [currentTab, setCurrentTab] = useState<'content' | 'pin'>('content');
const { data, setData } = useData();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Notificar cambios a componente padre
  useEffect(() => {
    if (onDataChange) {
      onDataChange(data);
    }
  }, [data, onDataChange]);

  const updateData = (newData: Partial<AppData>) => {
    setData(prev => ({ ...prev, ...newData }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsLoading(true);
    try {
      await onSave(data);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar los cambios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!hasUnsavedChanges) {
      alert('No hay cambios que cancelar');
      return;
    }
    
    const confirmed = window.confirm(
      'Esto restablecerá todos los cambios, incluyendo imágenes y textos. ¿Deseas continuar?'
    );
    
    if (confirmed && onCancel) {
      setIsLoading(true);
      try {
        await onCancel();
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error al cancelar:', error);
        alert('Error al cancelar los cambios');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Acciones para el dropdown genérico
  const dropdownActions = [
    {
      label: 'Importar',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      ),
      onClick: onImport || (() => {}),
      disabled: !onImport
    },
    {
      label: 'Exportar',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17,8 12,3 7,8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      ),
      onClick: onExport || (() => {}),
      disabled: !onExport
    },
    {
      label: 'Reiniciar',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 4v6h6"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
      ),
      onClick: onRestart || (() => {}),
      disabled: !onRestart
    },
    {
      label: 'Salir',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      ),
      onClick: async () => {
        if (window.confirm('¿Estás seguro de que deseas salir del panel administrativo?')) {
          if (onExit) await onExit();
        }
      },
      danger: true,
      disabled: !onExit
    }
  ];
  
if (!data) {
    return <div className="admin-panel-loading">Cargando datos...</div>;
  }

  return (
    <div className="admin-panel">
      {/* Header con dropdown de acciones */}
      <header className="admin-header">
        <h1 className="admin-title">Panel Administrativo</h1>
        <ActionsDropdown actions={dropdownActions} />
      </header>

      {/* Sistema de Tabs */}
      <div className="tabs-container">
        <div className="tabs-header">
          <TabButton
            active={currentTab === 'content'}
            onClick={() => setCurrentTab('content')}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            }
            text="Contenido"
          />
          
          <TabButton
            active={currentTab === 'pin'}
            onClick={() => setCurrentTab('pin')}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            }
            text="PIN"
          />
        </div>

        {/* Contenido de los tabs */}
        <div className="tab-content-wrapper">
          {/* Tab de Contenido */}
          <div className={`tab-content ${currentTab === 'content' ? 'active' : ''}`}>
            <div className="tab-panel">
              {/* Sección del Logo */}
              <LogoSection
                logoData={data.logo}
                onLogoUpdate={(logoData) => updateData({ logo: logoData })}
              />

              {/* Sección de Videos */}
              <VideosSection
                videos={data.welcomeVideos || []}
                onVideosUpdate={(videos) => updateData({ welcomeVideos: videos })}
              />

              {/* Sección de Opciones */}
              <OptionsSection
                buttons={data.buttons}
                onButtonsUpdate={(buttons) => updateData({ buttons })}
              />

              {/* Botones de acción del tab de contenido */}
              <div className="tab-actions">
                <ActionButton
                  variant="secondary"
                  size="large"
                  onClick={handleCancel}
                  disabled={isLoading}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M15 9l-6 6"/>
                      <path d="M9 9l6 6"/>
                    </svg>
                  }
                >
                  Cancelar
                </ActionButton>
                
                <ActionButton
                  variant="primary"
                  size="large"
                  onClick={handleSave}
                  disabled={isLoading}
                  loading={isLoading}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17,21 17,13 7,13 7,21"/>
                      <polyline points="7,3 7,8 15,8"/>
                    </svg>
                  }
                >
                  Guardar
                </ActionButton>
              </div>
            </div>
          </div>

          {/* Tab de PIN */}
          <div className={`tab-content ${currentTab === 'pin' ? 'active' : ''}`}>
            <div className="tab-panel">
              <PinSection/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;