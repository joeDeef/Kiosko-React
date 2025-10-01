import { VideoBackground, Logo } from '../../components';
import { ButtonGrid } from '../../sections';
import { useAssetPath, useData } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { ButtonData } from '../../../shared/types';

import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { img, video } = useAssetPath();
  const { data, loading, error } = useData();

  const handleButtonClick = (button: ButtonData) => {
    navigate('/information', {
      state: {
        videos: button.videos,
        logo: data.logo,
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

  if (error || !data) {
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
      {data.welcomeVideos?.length > 0 && (
        <VideoBackground
          videos={data.welcomeVideos}
          getAssetPath={(type, filename) => video(filename)}
          muted={false}
          loop={true}
        />
      )}

      {/* Logo */}
      {data.logo?.image && (
        <Logo
          src={img(data.logo.image)}
          position={data.logo.position}
          alt="Logo de la empresa"
        />
      )}

      {/* Grid de botones */}
      {data.buttons?.length > 0 && (
        <ButtonGrid
          buttons={data.buttons}
          onButtonClick={handleButtonClick}
        />
      )}
    </div>
  );
};

export default Home;
