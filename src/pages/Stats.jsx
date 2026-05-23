import { useStickers } from '../context/StickerContext';
import { useNavigate } from 'react-router-dom';
import './Stats.css';

import { LogOut, UserPlus, Shield } from 'lucide-react';

export default function Stats() {
  const navigate = useNavigate();
  const { stats, logout, user } = useStickers();
  const percentage = ((stats.owned / stats.total) * 100).toFixed(1);

  const mainEmail = import.meta.env.VITE_MAIN_EMAIL || 'familia@exemplo.com';
  const isMaster = user && user.email === mainEmail;

  return (
    <div className="page-container">
      <div className="header-sticky">
        <div className="header-top">
          <h1>Estatísticas</h1>
          <button className="logout-btn" onClick={logout} title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      
      <div className="stats-content">
        <div className="progress-section">
          <h2>Progresso do Álbum</h2>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            <span className="percentage">{percentage}% Completo</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total do Álbum</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card primary">
            <span className="stat-label">Tenho</span>
            <span className="stat-value">{stats.owned}</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-label">Faltam</span>
            <span className="stat-value">{stats.missing}</span>
          </div>
          <div className="stat-card danger">
            <span className="stat-label">Repetidas (Para Troca)</span>
            <span className="stat-value">{stats.repeated}</span>
          </div>
        </div>

        {isMaster && (
          <div className="admin-section">
            <h2>
              <Shield size={20} />
              Painel do Administrador
            </h2>
            <p>
              Você está logado como a conta Master. Como administrador, você pode gerenciar a criação de novos álbuns para os amigos do seu filho.
            </p>
            <button className="admin-btn" onClick={() => navigate('/register')}>
              <UserPlus size={18} />
              Cadastrar Novo Amigo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
