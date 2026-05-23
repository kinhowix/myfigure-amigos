import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, REGISTRATION_CODE } from '../firebase/config';
import './Login.css';

import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [masterCode, setMasterCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }

      if (masterCode !== REGISTRATION_CODE) {
        setError('Código Master de Cadastro incorreto.');
        setLoading(false);
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (err) {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
          setError('Este e-mail já está em uso.');
        } else if (err.code === 'auth/weak-password') {
          setError('A senha deve ter pelo menos 6 caracteres.');
        } else if (err.code === 'auth/invalid-email') {
          setError('E-mail inválido.');
        } else {
          setError('Erro ao criar conta. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        console.error(err);
        setError('E-mail ou senha incorretos.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <button className="back-link" onClick={() => navigate('/')}>&larr; Voltar</button>
        <h1>MyFigure</h1>
        <p className="login-subtitle">
          {isRegistering ? 'Criar novo álbum' : 'O álbum dos amigos'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleAuth} className="login-form">
          <div className="input-group">
            <label>E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              required
            />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
            />
          </div>

          {isRegistering && (
            <>
              <div className="input-group">
                <label>Confirmar Senha</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  required
                />
              </div>
              <div className="input-group">
                <label>Código de Cadastro Master</label>
                <input 
                  type="password" 
                  value={masterCode}
                  onChange={(e) => setMasterCode(e.target.value)}
                  placeholder="Digite a senha master"
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processando...' : isRegistering ? 'Criar Álbum' : 'Entrar no Álbum'}
          </button>
        </form>

        <button 
          className="toggle-auth-mode" 
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
        >
          {isRegistering ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Cadastrar Novo Álbum'}
        </button>
      </div>
    </div>
  );
}

