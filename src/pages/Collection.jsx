import { useState } from 'react';
import { useStickers } from '../context/StickerContext';
import { stickerGroups } from '../data/stickersConfig';
import './Collection.css';

import { LogOut, Search } from 'lucide-react';

export default function Collection() {
  const { stickers, incrementSticker, removeSticker, logout } = useStickers();
  const [selectedGroupId, setSelectedGroupId] = useState(stickerGroups[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedCode, setHighlightedCode] = useState(null);

  const activeGroup = stickerGroups.find(g => g.id === selectedGroupId);
  const isCocaCola = activeGroup.id === 'cc';

  const normalizeString = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Filter groups for the dropdown based on search
  const filteredGroups = stickerGroups.filter(group => {
    const normalizedQuery = normalizeString(searchQuery);
    return normalizeString(group.name).includes(normalizedQuery) ||
           normalizeString(group.prefix).includes(normalizedQuery);
  });

  // Generates the codes for the active group
  const getActiveGroupCodes = () => {
    const codes = [];
    if (activeGroup.hasZero) {
      codes.push('00');
    }
    for (let i = 1; i <= activeGroup.count; i++) {
      codes.push(`${activeGroup.prefix} ${i}`);
    }
    return codes;
  };

  const activeCodes = getActiveGroupCodes();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    
    // Try to detect sticker code (e.g., TUR 29 or TUR29)
    const codeMatch = query.match(/^([A-Z]{2,3})\s*(\d+)$/);
    
    if (codeMatch) {
      const prefix = codeMatch[1];
      const numberStr = codeMatch[2];
      const number = parseInt(numberStr);
      
      const foundGroup = stickerGroups.find(g => g.prefix === prefix);
      if (foundGroup) {
        // Check if the number is valid for the group
        const isZero = numberStr === '00' || number === 0;
        const isValidNumber = (isZero && foundGroup.hasZero) || (number >= 1 && number <= foundGroup.count);
        
        if (isValidNumber) {
          const finalCode = isZero ? '00' : `${prefix} ${number}`;
          setSelectedGroupId(foundGroup.id);
          setSearchQuery('');
          setHighlightedCode(finalCode);
          
          // Clear highlight after 3 seconds
          setTimeout(() => setHighlightedCode(null), 3000);
          
          // Close mobile keyboard
          if (document.activeElement) {
            document.activeElement.blur();
          }
          return;
        }
      }
    }

    // Fallback to normal country search if no code match
    if (filteredGroups.length > 0) {
      setSelectedGroupId(filteredGroups[0].id);
      setSearchQuery('');
      // Close mobile keyboard
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  };

  return (
    <div className={`page-container ${isCocaCola ? 'coca-cola-theme' : ''}`} style={{ '--team-color': activeGroup.color }}>
      <div className="header-sticky">
        <div className="header-top">
          <div className="team-header">
            {activeGroup.flag && activeGroup.flag !== 'cc' && (
              <img 
                src={`https://flagcdn.com/w40/${activeGroup.flag}.png`} 
                alt={activeGroup.name} 
                className="team-flag"
              />
            )}
            {isCocaCola && <div className="coca-cola-logo">Coca-Cola</div>}
            <h1>{activeGroup.name}</h1>
          </div>
          <button className="logout-btn" onClick={logout} title="Sair">
            <LogOut size={20} />
          </button>
        </div>

        <div className="search-container">
          <form className="search-input-wrapper" onSubmit={handleSearchSubmit}>
            <Search size={16} className="search-icon" />
            <input 
              type="search" 
              placeholder="Buscar seleção..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              enterKeyHint="search"
            />
          </form>
        </div>
        
        <div className="group-selector">
          <select 
            value={selectedGroupId} 
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="group-dropdown"
          >
            {filteredGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
            {filteredGroups.length === 0 && (
              <option disabled>Nenhuma seleção encontrada</option>
            )}
          </select>
        </div>
      </div>

      <div className="collection-grid">
        {activeCodes.map(code => {
          const stickerData = stickers[code] || { count: 0 };
          return (
            <div 
              key={code} 
              className={`sticker-card ${stickerData.count > 0 ? 'owned' : 'missing'} ${highlightedCode === code ? 'highlight-pulse' : ''}`}
              onClick={() => incrementSticker(code)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (stickerData.count > 0) {
                  if (window.confirm('Deseja limpar esta figurinha?')) {
                    removeSticker(code);
                  }
                }
              }}
            >
              <div className="sticker-info">
                <span className="sticker-prefix">{activeGroup.prefix}</span>
                <span className="sticker-number">{code.replace(activeGroup.prefix + ' ', '')}</span>
              </div>
              {stickerData.count > 1 && (
                <span className="repeated-badge">+{stickerData.count - 1}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
