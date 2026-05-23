import { NavLink } from 'react-router-dom';
import { BookOpen, Copy, PieChart } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
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
    </nav>
  );
}
