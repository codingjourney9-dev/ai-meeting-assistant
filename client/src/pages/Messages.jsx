import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import request from '../api/apiClient';
import FriendManager from '../components/FriendManager';

export default function Messages() {
  const { user, globalSocket } = useAuth();
  
  const [friends, setFriends] = useState([]);
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  
  const [showFriendManager, setShowFriendManager] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchFriends = async () => {
    try {
      const data = await request('/friends');
      setFriends(data);
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  
  useEffect(() => {
    if (!globalSocket) return;

    const handleReceiveMessage = (msg) => {
      
      if (activeChat && activeChat.conversationId === msg.conversationId) {
        setMessages(prev => [...prev, msg]);
      } else {
        
        console.log('New message received from', msg.senderId);
      }
    };

    const handleMessageSent = (msg) => {
      if (activeChat && activeChat.conversationId === msg.conversationId) {
        
        
        setMessages(prev => [...prev, msg]);
      }
    };

    globalSocket.on('receive-message', handleReceiveMessage);
    globalSocket.on('message-sent', handleMessageSent);

    return () => {
      globalSocket.off('receive-message', handleReceiveMessage);
      globalSocket.off('message-sent', handleMessageSent);
    };
  }, [globalSocket, activeChat]);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openChat = async (friend) => {
    setActiveChat({ friend, conversationId: null });
    setMessages([]); 
    
    try {
      
      const conversation = await request('/chat/conversation', {
        method: 'POST',
        body: JSON.stringify({ friendId: friend._id })
      });
      
      setActiveChat({ friend, conversationId: conversation._id });

      
      const msgs = await request(`/chat/${conversation._id}/messages`);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !activeChat.conversationId || !globalSocket) return;

    globalSocket.emit('send-message', {
      conversationId: activeChat.conversationId,
      receiverId: activeChat.friend._id,
      text: messageInput.trim()
    });

    setMessageInput('');
    
    
  };

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', height: 'calc(100vh - 64px)', margin: '-32px -36px', overflow: 'hidden' }}>
      
      {}
      <div style={{ width: 320, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Messages</h2>
          <button className="btn-ghost" onClick={() => setShowFriendManager(!showFriendManager)} style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
            {showFriendManager ? '✕ Close' : '➕ Add Friend'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {showFriendManager && (
            <div style={{ marginBottom: 24 }}>
              <FriendManager onFriendAdded={fetchFriends} />
            </div>
          )}

          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, paddingLeft: 8 }}>Your Friends</h3>
          
          {friends.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <div className="empty-state-title">No friends yet</div>
              <div className="empty-state-desc">Click 'Add Friend' to start a conversation.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {friends.map(friend => (
                <button
                  key={friend._id}
                  onClick={() => openChat(friend)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px',
                    background: activeChat?.friend?._id === friend._id ? 'var(--bg-card)' : 'transparent',
                    border: 'none', borderRadius: 'var(--r-md)', cursor: 'pointer',
                    textAlign: 'left', transition: 'var(--t-fast)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = activeChat?.friend?._id === friend._id ? 'var(--bg-card)' : 'rgba(0,0,0,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = activeChat?.friend?._id === friend._id ? 'var(--bg-card)' : 'transparent'}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-base)', fontWeight: 'bold' }}>
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{friend.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                      {friend.email}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
        {!activeChat ? (
          <div className="empty-state" style={{ margin: 'auto' }}>
            <div className="empty-state-icon">💬</div>
            <div className="empty-state-title">Select a Conversation</div>
            <div className="empty-state-desc">Choose a friend from the sidebar to start chatting.</div>
          </div>
        ) : (
          <>
            {}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-base)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {activeChat.friend.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{activeChat.friend.name}</h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{activeChat.friend.email}</span>
              </div>
            </div>

            {}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  This is the beginning of your direct message history with {activeChat.friend.name}.
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user._id;
                  return (
                    <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div style={{ 
                        background: isMe ? 'var(--accent)' : 'var(--bg-tertiary)', 
                        color: isMe ? 'var(--bg-base)' : 'var(--text-primary)',
                        padding: '12px 16px', borderRadius: '16px', fontSize: '1rem',
                        maxWidth: '75%', wordBreak: 'break-word',
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderBottomLeftRadius: !isMe ? 4 : 16,
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {}
            <form onSubmit={handleSend} style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', gap: 12 }}>
              <input
                type="text"
                placeholder={`Message ${activeChat.friend.name}...`}
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                style={{ flex: 1, padding: '14px 20px', borderRadius: '30px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '1rem' }}
              />
              <button type="submit" className="btn-primary" disabled={!messageInput.trim()} style={{ borderRadius: '50%', width: 50, height: 50, padding: 0, justifyContent: 'center' }}>
                <span style={{ marginLeft: -2 }}>➤</span>
              </button>
            </form>
          </>
        )}
      </div>

    </div>
  );
}
