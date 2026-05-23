import { createContext, useState, useEffect, useContext } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { stickerGroups, generateEmptyStickersMap, getTotalStickersCount } from '../data/stickersConfig';

const StickerContext = createContext();

export const StickerProvider = ({ children }) => {
  const [stickers, setStickers] = useState(generateEmptyStickersMap());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth State Changed:", currentUser ? "Logged In" : "Logged Out");
      setUser(currentUser);
      
      // If no user, we can stop loading immediately
      if (!currentUser) {
        setLoading(false);
      }
    });

    // Safety timeout: if nothing happens in 10 seconds, stop loading
    // to avoid the "blue screen of death" on mobile
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Firestore Listener for the Family Album
  useEffect(() => {
    if (!user) return;

    console.log("Setting up Firestore listener for user:", user.email);
    const mainEmail = import.meta.env.VITE_MAIN_EMAIL || 'familia@exemplo.com';
    const albumId = user.email === mainEmail ? 'familia' : user.uid;
    const albumRef = doc(db, 'albums', albumId);

    const unsubscribe = onSnapshot(albumRef, (docSnap) => {
      if (docSnap.exists()) {
        const allData = docSnap.data() || {};
        // Tenta pegar do campo 'stickers' ou da raiz do documento (retrocompatibilidade)
        const dbData = allData.stickers || allData;
        const emptyMap = generateEmptyStickersMap();
        
        // Create a fast lookup map (no spaces, uppercase)
        const dbLookup = {};
        Object.entries(dbData).forEach(([key, val]) => {
          if (key && val) {
            const normalizedKey = key.replace(/\s+/g, '').toUpperCase();
            dbLookup[normalizedKey] = val;
          }
        });

        // Map database data to current config format
        const mergedStickers = { ...emptyMap };
        Object.keys(mergedStickers).forEach(configKey => {
          const normalizedConfigKey = configKey.replace(/\s+/g, '').toUpperCase();
          
          // 1. Try exact match
          if (dbData[configKey]) {
            mergedStickers[configKey] = dbData[configKey];
          } 
          // 2. Try normalized match (handles "BRA1" vs "BRA 1")
          else if (dbLookup[normalizedConfigKey]) {
            mergedStickers[configKey] = dbLookup[normalizedConfigKey];
          }
          // 3. Try flag-based fallback (handles prefix changes like "BR" -> "BRA")
          else {
            const parts = configKey.split(' ');
            const prefix = parts[0];
            const number = parts[1] || '';
            const group = stickerGroups.find(g => g.prefix === prefix);
            
            if (group && group.flag) {
              const flagPrefix = group.flag.toUpperCase();
              const flagKey = number ? `${flagPrefix} ${number}` : flagPrefix;
              const normalizedFlagKey = flagKey.replace(/\s+/g, '').toUpperCase();
              
              if (dbData[flagKey]) {
                mergedStickers[configKey] = dbData[flagKey];
              } else if (dbLookup[normalizedFlagKey]) {
                mergedStickers[configKey] = dbLookup[normalizedFlagKey];
              }
            }
          }
        });

        setStickers(mergedStickers);
      } else {
        console.log("Album not found, creating new one");
        setDoc(albumRef, { stickers: generateEmptyStickersMap() });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching album:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Actions
  const updateFirebase = async (code, stickerData) => {
    if (!user) return;
    const mainEmail = import.meta.env.VITE_MAIN_EMAIL || 'familia@exemplo.com';
    const albumId = user.email === mainEmail ? 'familia' : user.uid;
    const albumRef = doc(db, 'albums', albumId);
    try {
      // Atualização atômica: atualiza apenas uma figurinha no mapa 'stickers'
      // Isso é muito mais performático e evita sobrescrever dados de outros usuários
      await updateDoc(albumRef, {
        [`stickers.${code}`]: stickerData
      });
    } catch (error) {
      console.error("Erro na atualização atômica, tentando merge:", error);
      // Fallback para setDoc caso o campo stickers ainda não exista
      await setDoc(albumRef, { 
        stickers: { [code]: stickerData } 
      }, { merge: true });
    }
  };

  const incrementSticker = (code) => {
    setStickers(prev => {
      const current = prev[code] || { count: 0, note: '' };
      const nextData = { ...current, count: current.count + 1 };
      
      // Agenda a atualização no Firebase (fora do ciclo de renderização direta)
      setTimeout(() => updateFirebase(code, nextData), 0);
      
      return { ...prev, [code]: nextData };
    });
  };

  const decrementSticker = (code) => {
    setStickers(prev => {
      const current = prev[code] || { count: 0, note: '' };
      if (current.count > 0) {
        const nextData = { ...current, count: current.count - 1 };
        
        setTimeout(() => updateFirebase(code, nextData), 0);
        
        return { ...prev, [code]: nextData };
      }
      return prev;
    });
  };



  const logout = () => {
    auth.signOut().then(() => {
      // Verifica se é mobile (iOS ou Android)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // No celular, tenta fechar a aba (comportamento de fechar app)
        // Nota: window.close() só funciona se a aba foi aberta pelo script ou em modo standalone PWA em alguns casos
        window.close();
        
        // Se não fechar, redireciona para a home após um breve delay
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        // No PC, força o redirecionamento para a página inicial (Landing)
        window.location.href = '/';
      }
    }).catch(err => {
      console.error("Erro ao sair:", err);
      window.location.href = '/';
    });
  };



  const removeSticker = (code) => {
    setStickers(prev => {
      const current = prev[code] || { count: 0, note: '' };
      const nextData = { ...current, count: 0 };
      
      setTimeout(() => updateFirebase(code, nextData), 0);
      
      return { ...prev, [code]: nextData };
    });
  };

  // Stats calculation
  const stats = {
    total: getTotalStickersCount(),
    owned: 0,
    missing: 0,
    repeated: 0
  };

  Object.values(stickers).forEach(s => {
    if (s.count > 0) stats.owned += 1;
    if (s.count === 0) stats.missing += 1;
    if (s.count > 1) stats.repeated += (s.count - 1);
  });

  return (
    <StickerContext.Provider value={{
      stickers,
      user,
      loading,
      incrementSticker,
      decrementSticker,
      logout,
      removeSticker,
      stats
    }}>
      {children}
    </StickerContext.Provider>
  );
};

export const useStickers = () => useContext(StickerContext);
