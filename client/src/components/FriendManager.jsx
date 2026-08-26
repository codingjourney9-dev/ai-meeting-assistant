import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import request from '../api/apiClient'; 

export default function FriendManager({ onFriendAdded }) {
  const { token } = useAuth();
  
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      const data = await request('/friends/requests');
      setPendingRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const data = await request(`/friends/search?email=${encodeURIComponent(searchEmail)}`);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
      setError('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const data = await request('/friends/request', {
        method: 'POST',
        body: JSON.stringify({ receiverId: userId })
      });
      
      
      
      setMessage('Friend request sent!');
      setSearchResults(searchResults.filter(u => u._id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    try {
      await request(`/friends/request/${requestId}/${action}`, { method: 'POST' });
      
      
      fetchPendingRequests();
      if (action === 'accept' && onFriendAdded) {
        onFriendAdded(); 
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20, background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Add Friends</h3>
      
      {error && <div className="banner banner-danger" style={{ marginBottom: 12 }}>{error}</div>}
      {message && <div className="banner banner-success" style={{ marginBottom: 12 }}>{message}</div>}

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input 
          type="email" 
          placeholder="Search by email..." 
          value={searchEmail}
          onChange={e => setSearchEmail(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--bg-base)' }}
        />
        <button type="submit" className="btn-primary" disabled={loading || !searchEmail}>
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {searchResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 8 }}>Search Results</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {searchResults.map(user => (
              <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-base)', borderRadius: 'var(--r-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
                <button className="btn-secondary" onClick={() => handleSendRequest(user._id)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent)', marginBottom: 8 }}>Pending Requests</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingRequests.map(req => (
              <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-base)', borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--accent)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{req.senderId.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>wants to be friends</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-primary" onClick={() => handleRespondRequest(req._id, 'accept')} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>Accept</button>
                  <button className="btn-ghost" onClick={() => handleRespondRequest(req._id, 'reject')} style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--danger)' }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
