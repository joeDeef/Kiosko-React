import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './VideoEditorModal.css';

interface VideoEditorModalProps {
  videos: string[];
  onClose: () => void;
  onSave: (videos: string[], videosToDelete: string[]) => void;
}

const ITEMS_PER_VIEW = 4;

const VideoEditorModal: React.FC<VideoEditorModalProps> = ({ videos: initialVideos, onClose, onSave }) => {
  const [videoList, setVideoList] = useState<string[]>([...initialVideos]);
  const [originalVideoList] = useState<string[]>([...initialVideos]);
  const [videosMarkedForDeletion, setVideosMarkedForDeletion] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(videoList.length > 0 ? 0 : -1);
  const [carouselPosition, setCarouselPosition] = useState<number>(0);
  const [showEmptyState, setShowEmptyState] = useState<boolean>(videoList.length === 0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowEmptyState(videoList.length === 0);
  }, [videoList]);

  const maxPosition = Math.max(0, videoList.length - ITEMS_PER_VIEW);
  const handlePrev = () => setCarouselPosition(pos => Math.max(0, pos - ITEMS_PER_VIEW));
  const handleNext = () => setCarouselPosition(pos => Math.min(maxPosition, pos + ITEMS_PER_VIEW));

  const handleAddVideo = () => fileInputRef.current?.click();

  const validateFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Por favor selecciona un archivo de video válido.');
      return false;
    }
    if (file.size > 500 * 1024 * 1024) {
      alert('El archivo es demasiado grande. El tamaño máximo es 500MB.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;
    const tempKey = `temporal_${Date.now()}`;
    setVideoList(list => [...list, tempKey]);
    setCurrentVideoIndex(videoList.length);
    setShowEmptyState(false);
    fileInputRef.current!.value = '';
  };

  const handleRemoveVideo = () => {
    if (videoList.length === 0 || currentVideoIndex === -1) return;
    const toDelete = videoList[currentVideoIndex];
    if (!toDelete.startsWith('temporal_')) setVideosMarkedForDeletion(list => [...list, toDelete]);
    const newList = videoList.filter((_, idx) => idx !== currentVideoIndex);
    setVideoList(newList);
    setCurrentVideoIndex(newList.length > 0 ? Math.max(0, currentVideoIndex - 1) : -1);
  };

  const handleSave = () => {
    onSave(videoList, videosMarkedForDeletion);
    onClose();
  };

  const handleCancel = () => {
    setVideoList([...originalVideoList]);
    setVideosMarkedForDeletion([]);
    setCurrentVideoIndex(originalVideoList.length > 0 ? 0 : -1);
    setShowEmptyState(originalVideoList.length === 0);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Delete') handleRemoveVideo();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoList, currentVideoIndex]);

  const renderThumbnails = () =>
    videoList.map((videoKey, idx) => (
      <div
        key={videoKey}
        className={`video-thumbnail${idx === currentVideoIndex ? ' active' : ''}${videoKey.startsWith('temporal_') ? ' temporal' : ''}`}
        tabIndex={0}
        role="button"
        aria-label={`Reproducir video ${idx + 1}`}
        onClick={() => setCurrentVideoIndex(idx)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setCurrentVideoIndex(idx)}
      >
        <img src="" alt={`Video ${idx + 1}`} />
        <div className="play-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </div>
        {videoKey.startsWith('temporal_') && <div className="temporal-indicator">NUEVO</div>}
      </div>
    ));

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div className="video-editor-modal modal-content" role="document">
        <div className="app-container">
          {/* Header */}
          <header className="header">
            <div className="header-content">
              <div className="video-counter">
                <span className="counter-number" id="video-count">{videoList.length}</span>
                <span className="counter-label">videos</span>
              </div>
              <h1 className="page-title">Editor de Videos</h1>
              <button className="btn-add" onClick={handleAddVideo}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <span>Añadir Video</span>
              </button>
              <input type="file" ref={fileInputRef} accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          </header>
          
          {/* Main Content */}
          <main className="main-content">
            {/* Video Player Section */}
            <section className="video-player-section">
              <div className="video-wrapper">
                <div className="video-container">
                  <video id="video-player" controls playsInline>
                    <source id="video-source" src="" type="video/mp4" />
                    Tu navegador no soporta este formato de video.
                  </video>
                  <div className={`video-overlay${currentVideoIndex !== -1 ? ' hidden' : ''}`} id="video-overlay">
                    <div className="overlay-content">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                      <p>Selecciona un video para reproducir</p>
                    </div>
                  </div>
                  <div className="video-controls">
                    <button className="btn-control btn-remove" onClick={handleRemoveVideo} disabled={videoList.length === 0 || currentVideoIndex === -1}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Video Library Section */}
            <section className="video-library-section">
              <div className="library-header">
                <h2>Biblioteca de Videos</h2>
                <div className="carousel-navigation">
                  <button className="nav-btn prev" onClick={handlePrev} disabled={carouselPosition <= 0 || videoList.length === 0}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </button>
                  <button className="nav-btn next" onClick={handleNext} disabled={carouselPosition >= maxPosition || videoList.length === 0}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="carousel-wrapper">
                <div className="carousel-container" id="carousel-container">
                  <div className="carousel-track" id="video-carousel">
                    {renderThumbnails()}
                  </div>
                </div>
                <div className={`empty-state${showEmptyState ? '' : ' hidden'}`} id="empty-state">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                    <polygon points="12,6 17,13 7,13"/>
                  </svg>
                  <h3>No hay videos</h3>
                  <p>Añade tu primer video para comenzar</p>
                </div>
              </div>
            </section>
          </main>

          {/* Footer Actions */}
          <footer className="footer-actions">
            <button className="btn btn-secondary" onClick={handleCancel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={JSON.stringify(videoList) === JSON.stringify(originalVideoList)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
              Guardar Cambios
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VideoEditorModal;
