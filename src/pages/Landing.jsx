import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="album-preview">
          <img src="/cover.png" alt="Capa do Álbum" className="cover-img" />
        </div>
        <div className="landing-text">
          <h1>MyFigure World Cup</h1>
          <p>Gerencie sua coleção de figurinhas da Copa do Mundo 2026 de forma fácil e em tempo real com sua família.</p>
          <button className="start-btn" onClick={() => navigate('/login')}>
            Entrar no Álbum
          </button>
        </div>
      </div>
    </div>
  );
}
