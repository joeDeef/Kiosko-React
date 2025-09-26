import React from 'react';
import './Home.css';
import { VideoBackground, Logo } from '../../components';
import { ButtonGrid } from '../../sections';
import { useAssetPath, useAssets } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { ButtonData } from '../../../shared/types';

import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { appData, loading, error } = useAssets();
  const { img, video } = useAssetPath();

  const handleButtonClick = (button: ButtonData) => {
    navigate('/information', {
      state: {
        videos: button.videos,
        logo: appData.logo,
      },
    });
  };


  if (loading) {
    return (
      <div className="home-loading">
        <div className="home-loading__spinner" />
        <p>Cargando contenido...</p>
      </div>
    );
  }

  if (error || !appData) {
    return (
      <div className="home-error">
        <h2>Error al cargar la aplicación</h2>
        <p>{error || 'No se pudieron cargar los datos'}</p>
        <button onClick={() => window.location.reload()} className="home-error__retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Video de fondo */}
      {appData.welcomeVideos?.length > 0 && (
        <VideoBackground
          videos={appData.welcomeVideos}
          getAssetPath={(type, filename) => video(filename)}
          muted={false}
          loop={true} // Home: loop infinito
        />
      )}

      {/* Logo */}
      {appData.logo?.image && (
        <Logo
          src={img(appData.logo.image)}
          position={appData.logo.position}
          alt="Logo de la aplicación"
        />
      )}

      {/* Grid de botones */}
      <ButtonGrid
        buttons={appData.buttons || []}
        onButtonClick={handleButtonClick}
      />
    </div>
  );
};

export default Home;
