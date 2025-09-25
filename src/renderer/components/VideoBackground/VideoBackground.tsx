import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import './VideoBackground.css';

interface VideoBackgroundProps {
  videos: string[];
  getAssetPath: (type: 'img' | 'videos', filename: string) => string;
  muted?: boolean;
  className?: string;
  onEnded?: () => void;
  loop?: boolean; // flag para Home
}

// Esta interfaz define los métodos accesibles desde el padre
export interface VideoBackgroundRef {
  restartVideo: () => void;
}

const VideoBackground = forwardRef<VideoBackgroundRef, VideoBackgroundProps>(({
  videos,
  getAssetPath,
  muted = false,
  className = '',
  onEnded,
  loop = false
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentVideoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);

  const playNextVideo = async () => {
    if (!videos.length || !containerRef.current) return;

    try {
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      const videoPath = getAssetPath('videos', randomVideo);

      const video = document.createElement('video');
      video.autoplay = true;
      video.loop = false; // controlamos loop manualmente
      video.muted = muted;
      video.playsInline = true;

      const source = document.createElement('source');
      source.src = videoPath;
      source.type = 'video/mp4';
      video.appendChild(source);

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(video);
      currentVideoRef.current = video;

      video.addEventListener('ended', () => {
        if (loop) {
          playNextVideo(); // Home: siguiente video aleatorio
        } else {
          onEnded?.(); // Information: disparar callback
        }
      });

      video.addEventListener('error', handleVideoError);
      video.addEventListener('loadstart', () => setHasError(false));

    } catch (error) {
      console.error('Error cargando video:', error);
      handleVideoError();
    }
  };

  const handleVideoError = () => {
    console.error('Error reproduciendo video');
    setHasError(true);
    if (containerRef.current) {
      containerRef.current.style.background = 'linear-gradient(45deg, #1a1a2e, #16213e)';
    }
  };

  useEffect(() => {
    playNextVideo();
  }, [videos, getAssetPath]);

  useEffect(() => {
    if (currentVideoRef.current) {
      currentVideoRef.current.muted = muted;
    }
  }, [muted]);

  const restartVideo = () => {
    playNextVideo();
  };

  useImperativeHandle(ref, () => ({
    restartVideo
  }));

  if (hasError && videos.length === 0) {
    return (
      <div className={`video-background ${className}`} ref={containerRef}>
        <div className="video-background__error">
          <p>No se pudieron cargar los videos de fondo</p>
        </div>
      </div>
    );
  }

  return <div className={`video-background ${className}`} ref={containerRef} />;
});

export default VideoBackground;
