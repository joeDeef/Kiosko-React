import { useState } from 'react';
import { VideoEditorModal } from '../../components';
import './VideosSection.css';

interface VideosSectionProps {
  videos: string[];
}

const VideosSection: React.FC<VideosSectionProps> = ({
  videos,
}) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideos, setCurrentVideos] = useState<string[]>(videos);

  const handleRevisarVideos = () => {
    setShowVideoModal(true);
  };

  const handleSaveVideos = (updatedVideos: string[], videosToDelete: string[]) => {
    setCurrentVideos(updatedVideos);
    //if (onVideosUpdate) onVideosUpdate(updatedVideos); // notificar al padre
    setShowVideoModal(false);
    console.log('Videos eliminados:', videosToDelete);
  };

  return (
    <div className="videos-section">
      <h1>Videos de Bienvenida</h1>

      <div className="videos-controls">
        <button
          id="revisar-videos-btn"
          className="btn btn-primary"
          onClick={handleRevisarVideos}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
            <polygon points="5,3 19,12 5,21" />
          </svg>
          Revisar videos ({currentVideos.length})
        </button>
      </div>

      {showVideoModal && (
        <VideoEditorModal
          videos={videos}
          onClose={() => setShowVideoModal(false)}
          onSave={handleSaveVideos}
        />
      )}
    </div>
  );
};

export default VideosSection;
