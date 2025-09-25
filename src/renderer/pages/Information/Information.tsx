import React, { useEffect } from 'react';
import './Information.css';
import { Logo, VideoBackground } from '../../components';
import { useAssetPath } from '../../hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import './Information.css';

interface LocationState {
  videos: string[];
  logo: {
    image: string;
    position: "derecha" | "centro" | "izquierda";
  };
}

const Information: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { videos: videosList, logo } = (location.state as LocationState);
  const { img, video } = useAssetPath();

  useEffect(() => {
    if (!videosList.length) {
      navigate('/home');
    }
  }, [videosList, navigate]);

  return (
    <div className="information">
      {/* Video de fondo */}
      {videosList?.length > 0 && (
        <VideoBackground
          videos={videosList}
          getAssetPath={(type, filename) => video(filename)}
          muted={false}
          onEnded={() => navigate('/home')} // Information: solo 1 video
          loop={false}
        />
      )}

      {/* Logo */}
      {logo?.image && (
        <Logo
          src={img(logo.image)}
          position={logo.position}
          alt="Logo"
          className="information-logo"
        />
      )}
    </div>
  );
};

export default Information;
