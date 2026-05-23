import { Routes, Route, Navigate } from 'react-router-dom';
import { useStickers } from './context/StickerContext';
import BottomNav from './components/BottomNav';
import Collection from './pages/Collection';
import Repeated from './pages/Repeated';
import Stats from './pages/Stats';
import Login from './pages/Login';
import Landing from './pages/Landing';

function App() {
  const { user, loading } = useStickers();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando Álbum da Família...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Routes>
        <Route path="/collection" element={<Collection />} />
        <Route path="/repeated" element={<Repeated />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="*" element={<Navigate to="/collection" />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
