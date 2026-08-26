import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [globalSocket, setGlobalSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          
          
          const socket = io({
            path: '/global-socket',
            auth: { token }
          });
          
          socket.on('connect', () => console.log('[global-socket] Connected'));
          setGlobalSocket(socket);

        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      if (globalSocket) {
        globalSocket.disconnect();
      }
    };
    
  }, [token]);

  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(userData);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (globalSocket) {
      globalSocket.disconnect();
      setGlobalSocket(null);
    }
    navigate('/login');
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-base)' }}><div className="spinner" /></div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, globalSocket }}>
      {children}
    </AuthContext.Provider>
  );
};
