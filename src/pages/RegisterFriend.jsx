import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebase/config';
import { generateEmptyStickersMap } from '../data/stickersConfig';
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import './RegisterFriend.css';

export default function RegisterFriend() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    let tempApp = null;
    try {
      // 1. Inicializa um app Firebase secundário temporário para criar o usuário
      // Isso impede que o administrador seja desconectado do app principal!
      const tempAppName = `TempApp_${Date.now()}`;
      tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);

      // 2. Cria o novo usuário no Authentication
      const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
      const newUid = userCredential.user.uid;

      // 3. Inicializa o álbum do amigo no Firestore usando a conexão principal (db)
      const albumRef = doc(db, 'albums', newUid);
      await setDoc(albumRef, {
        stickers: generateEmptyStickersMap()
      });

      setSuccess(`Álbum criado com sucesso para o e-mail: ${email}`);
      setEmail('');
      setPassword('');
      confirmPassword && setConfirmPassword('');
    } catch (err) {
      console.error('Erro ao cadastrar amigo:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado.');
      } else if (err.code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError(`Erro ao cadastrar: ${err.message}`);
      }
    } finally {
      // 4. Limpa e exclui o app temporário para liberar memória
      if (tempApp) {
        try {
          await deleteApp(tempApp);
        } catch (cleanupErr) {
          console.error('Erro ao limpar app temporário:', cleanupErr);
        }
      }
      setLoading(false);
    }
  };

  return (
    <div className="register-friend-container">
      <div className="register-friend-box">
        <button className="back-btn-admin" onClick={() => navigate('/stats')}>
          <ArrowLeft size={18} />
          Voltar para Estatísticas
        </button>

        <div className="admin-badge">Painel Admin</div>
        
        <div className="register-header">
          <div className="header-icon-container">
            <UserPlus size={28} className="header-icon" />
          </div>
          <h1>Cadastrar Novo Amigo</h1>
          <p>Crie um álbum isolado para um novo amigo começar a colecionar.</p>
        </div>

        {error && (
          <div className="status-message error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="status-message success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <label>E-mail do Amigo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: amigo@exemplo.com"
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Definir Senha inicial</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Confirmar Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-admin-submit" disabled={loading}>
            {loading ? 'Processando Cadastro...' : 'Criar Álbum do Amigo'}
          </button>
        </form>
      </div>
    </div>
  );
}
