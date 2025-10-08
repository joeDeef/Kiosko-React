import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAssetPath } from '../../hooks';
import './VideoEditorModal.css';

interface VideoEditorModalProps {
  videos: string[];
  onClose: () => void;
  onSave: (videos: string[], videosToDelete: string[]) => void;
}

const ITEMS_PER_VIEW = 4;

const VideoEditorModal: React.FC<VideoEditorModalProps> = ({ videos: initialVideos, onClose, onSave }) => {
  const [videoList, setVideoList] = useState([...initialVideos]);
  const [originalVideoList] = useState([...initialVideos]);
  const [videosMarkedForDeletion, setVideosMarkedForDeletion] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(videoList.length > 0 ? 0 : -1);
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [sessionTempVideos, setSessionTempVideos] = useState<string[]>([]);
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const { video, tempVideo } = useAssetPath();

  // === Helpers ===
  const maxPosition = Math.max(0, videoList.length - ITEMS_PER_VIEW);
  const showEmptyState = videoList.length === 0;
  const hasChanges =
    videoList.length !== originalVideoList.length ||
    videoList.some((v, i) => v !== originalVideoList[i]);

  const getVideoSrc = (key: string) => {
    if (key.startsWith('temporal_')) {
        return tempVideo(key)
      }
    return video(key)
  }

  // === Reproducir video actual ===
  useEffect(() => {
    if (!videoRef.current || currentVideoIndex === -1) {
      setCurrentVideoSrc('');
      return;
    }

    const currentVideo = videoList[currentVideoIndex];
    if (!currentVideo) {
      setCurrentVideoSrc('');
      return;
    }

    const src = getVideoSrc(currentVideo);
    console.log('🎬 Cargando video:', currentVideo);
    console.log('   Es temporal?', currentVideo.startsWith('temporal_'));
    console.log('✅ Fuente obtenida:', src);
    setCurrentVideoSrc(src);
  }, [currentVideoIndex, videoList]);

  // Reproducir cuando cambia la fuente
  useEffect(() => {
    if (!videoRef.current || !currentVideoSrc) return;

    const videoEl = videoRef.current;
    console.log('🎥 Estableciendo src en video element:', currentVideoSrc);

    // Limpiar eventos anteriores
    videoEl.onloadedmetadata = null;
    videoEl.onerror = null;

    // Configurar nuevos eventos
    videoEl.onloadedmetadata = () => {
      console.log('✅ Metadata cargada, intentando reproducir...');
      videoEl.play()
        .then(() => console.log('▶️ Video reproduciendo'))
        .catch(err => console.error('❌ Error al reproducir:', err));
    };

    videoEl.onerror = (e) => {
      console.error('❌ Error en elemento video:', e);
      console.error('   Error code:', videoEl.error?.code);
      console.error('   Error message:', videoEl.error?.message);
    };

    // Establecer fuente
    videoEl.src = currentVideoSrc;
    videoEl.load();
  }, [currentVideoSrc]);

  // Carousel controls
  const handlePrev = () => setCarouselPosition(pos => Math.max(0, pos - ITEMS_PER_VIEW));
  const handleNext = () => setCarouselPosition(pos => Math.min(maxPosition, pos + ITEMS_PER_VIEW));

  const handleAddVideo = async () => {
    const filePaths = await window.electronAPI.openFileDialog();
    if (!filePaths || filePaths.length === 0) return;

    const originalPath = filePaths[0];
    const ext = originalPath.split('.').pop()?.toLowerCase();

    if (!ext) {
      alert('No se pudo determinar la extensión del archivo.');
      return;
    }

    const savedFileName = await window.electronAPI.saveTempVideo(originalPath, ext, 'temporal');

    if (!savedFileName) {
      alert('No se pudo guardar el archivo.');
      return;
    }

    setVideoList(prev => {
      const newList = [...prev, savedFileName];
      setCurrentVideoIndex(newList.length - 1);
      return newList;
    });

    setSessionTempVideos(list => [...list, savedFileName]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Esta función ya no se usa con el diálogo nativo
    // Se mantiene por compatibilidad pero no debería ser llamada
    console.warn('handleFileChange llamado, se recomienda usar handleAddVideo con diálogo nativo');
  };



  // === Remove video ===
  const handleRemoveVideo = () => {
    if (videoList.length === 0 || currentVideoIndex === -1) return;
    const toDelete = videoList[currentVideoIndex];
    if (!toDelete.startsWith('temporal_')) {
      setVideosMarkedForDeletion(list => [...list, toDelete]);
    }
    const newList = videoList.filter((_, idx) => idx !== currentVideoIndex);
    setVideoList(newList);
    setCurrentVideoIndex(newList.length > 0 ? Math.max(0, currentVideoIndex - 1) : -1);
  };

  // === Save / Cancel ===
  const handleSave = () => {
    onSave(videoList, videosMarkedForDeletion);
    onClose();
  };

  const handleCancel = () => {
    setVideoList([...originalVideoList]);
    setVideosMarkedForDeletion([]);
    setSessionTempVideos([]);
    setCurrentVideoIndex(originalVideoList.length > 0 ? 0 : -1);
    onClose();
  };

  // === Keyboard shortcuts ===
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

  // === Render ===
  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      onClick={e => e.currentTarget === e.target && onClose()}
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
                <span className="counter-number">{videoList.length}</span>
                <span className="counter-label">videos</span>
              </div>
              <h1 className="page-title">Editor de Videos</h1>
              <button className="btn-add" onClick={handleAddVideo}>
                <span>＋</span>
                <span>Añadir Video</span>
              </button>
            </div>
          </header>

          {/* Main */}
          <main className="main-content">
            {/* Player */}
            <section className="video-player-section">
              <div className="video-wrapper">
                <div className="video-container">
                  <video id="video-player" ref={videoRef} controls playsInline>
                    Tu navegador no soporta este formato de video.
                  </video>

                  <div className={`video-overlay${currentVideoIndex !== -1 ? ' hidden' : ''}`}>
                    <p>Selecciona un video para reproducir</p>
                  </div>

                  <div className="video-controls">
                    <button
                      className="btn-control btn-remove"
                      onClick={handleRemoveVideo}
                      disabled={videoList.length === 0 || currentVideoIndex === -1}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Library */}
            <section className="video-library-section">
              <div className="library-header">
                <h2>Biblioteca de Videos</h2>
                <div className="carousel-navigation">
                  <button
                    className="nav-btn prev"
                    onClick={handlePrev}
                    disabled={carouselPosition <= 0 || videoList.length === 0}
                  >
                    ◀
                  </button>
                  <button
                    className="nav-btn next"
                    onClick={handleNext}
                    disabled={carouselPosition >= maxPosition || videoList.length === 0}
                  >
                    ▶
                  </button>
                </div>
              </div>

              <div className="carousel-wrapper">
                <div className="carousel-container">
                  <div className="carousel-track">
                    {videoList.map((videoKey, idx) => (
                      <div
                        key={videoKey}
                        className={`video-thumbnail${idx === currentVideoIndex ? ' active' : ''}${videoKey.startsWith('temporal_') ? ' temporal' : ''
                          }`}
                        tabIndex={0}
                        role="button"
                        aria-label={`Reproducir video ${idx + 1}`}
                        onClick={() => setCurrentVideoIndex(idx)}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setCurrentVideoIndex(idx)}
                      >
                        <img
                          src={
                            'data:image/svg+xml;base64,' +
                            btoa(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">
                                <rect width="200" height="120" fill="#333333"/>
                                <rect x="60" y="35" width="80" height="50" rx="8" fill="#555555"/>
                                <polygon points="85,45 85,65 105,55" fill="#ffffff"/>
                                <text x="100" y="95" text-anchor="middle" fill="#888888" font-family="system-ui" font-size="12">
                                  Video ${idx + 1}
                                </text>
                              </svg>
                            `)
                          }
                          alt={`Video ${idx + 1}`}
                        />
                        <div className="play-icon">▶</div>
                        {videoKey.startsWith('temporal_') && <div className="temporal-indicator">NUEVO</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`empty-state${showEmptyState ? '' : ' hidden'}`}>
                  <h3>No hay videos</h3>
                  <p>Añade tu primer video para comenzar</p>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="footer-actions">
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!hasChanges}>
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