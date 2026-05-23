import { useStickers } from '../context/StickerContext';
import './Repeated.css';

import { LogOut } from 'lucide-react';

export default function Repeated() {
  const { stickers, incrementSticker, decrementSticker, logout } = useStickers();

  // Transform object to array and filter repeated
  const repeatedStickers = Object.entries(stickers)
    .filter(([code, data]) => data.count > 1)
    .map(([code, data]) => ({ code, ...data }))
    .sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="page-container">
      <div className="header-sticky">
        <div className="header-top">
          <h1>Figurinhas Repetidas</h1>
          <button className="logout-btn" onClick={logout} title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {repeatedStickers.length === 0 ? (
        <div className="empty-state">
          <p>Você não tem nenhuma figurinha repetida ainda!</p>
        </div>
      ) : (
        <div className="repeated-list">
          {repeatedStickers.map(sticker => (
            <div key={sticker.code} className="repeated-card">
              <div className="repeated-header">
                <div className="repeated-number">
                  <span>{sticker.code}</span>
                </div>
                <div className="repeated-controls">
                  <button className="control-btn" onClick={() => decrementSticker(sticker.code)}>-</button>
                  <span className="repeated-count">{sticker.count - 1} </span>
                  <button className="control-btn" onClick={() => incrementSticker(sticker.code)}>+</button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
