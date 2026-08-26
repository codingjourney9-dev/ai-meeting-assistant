import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      
      login(data, data.token);
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Profile Settings</h1>

      <div className="card-elevated" style={{ padding: '32px' }}>
        {error && (
          <div className="banner banner-danger" style={{ marginBottom: 24 }}>
            <span>⚠️</span> <span>{error}</span>
          </div>
        )}
        
        {message && (
          <div className="banner banner-success" style={{ marginBottom: 24 }}>
            <span>✅</span> <span>{message}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'var(--bg-base)',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>{user?.name}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Display Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', background: 'var(--bg-base)' }}
            />
          </div>

          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Change Password</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>New Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Leave blank to keep current password"
                  style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', background: 'var(--bg-base)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Confirm new password"
                  style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', background: 'var(--bg-base)' }}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: 16, padding: '12px' }}>
            {loading ? <div className="spinner spinner-sm" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
