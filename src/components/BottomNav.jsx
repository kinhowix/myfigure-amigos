import { NavLink } from 'react-router-dom';
import { BookOpen, Copy, PieChart, UserPlus } from 'lucide-react';
import { useStickers } from '../context/StickerContext';
import './BottomNav.css';

export default function BottomNav() {
  const { user } = useStickers();
  const mainEmail = import.meta.env.VITE_MAIN_EMAIL || 'meyckjr@oticasparissul.com.br';
  const isMaster = user && user.email === mainEmail;

  return (
    <nav className="bottom-nav">
      <NavLink to="/collection" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <BookOpen size={24} />
        <span>Coleção</span>
      </NavLink>
      <NavLink to="/repeated" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Copy size={24} />
        <span>Repetidas</span>
      </NavLink>
      <NavLink to="/stats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <PieChart size={24} />
        <span>Estatísticas</span>
      </NavLink>
      {isMaster && (
        <NavLink to="/register" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UserPlus size={24} />
          <span>Cadastrar</span>
        </NavLink>
      )}
    </nav>
  );
}

