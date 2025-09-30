import React, { useState } from 'react';
import './VideosSection.css';

interface VideosSectionProps {
  videos: string[];
  onVideosUpdate?: (videos: string[]) => void;
  onOpenVideoEditor?: (videos: string[]) => void;
}

const VideosSection: React.FC<VideosSectionProps> = ({
  videos,
  onVideosUpdate,
  onOpenVideoEditor
}) => {
  const [showVideoList, setShowVideoList] = useState(false);

  const handleRevisarVideos = () => {
    if (onOpenVideoEditor) {
      // Si hay un editor personalizado, usarlo
      onOpenVideoEditor(videos);
    } else {
      // Si no, mostrar la lista simple
      setShowVideoList(true);
    }
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          Revisar videos ({videos.length})
        </button>
      </div>
    </div>
  );
};

export default VideosSection;