import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import MeetingDetail from './pages/MeetingDetail.jsx'
import VideoRoom from './pages/VideoRoom.jsx'
import Messages from './pages/Messages.jsx'
import Profile from './pages/Profile.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="sidebar">
      {}
      <div className="sidebar-logo" onClick={() => navigate('/')}>
        <div className="sidebar-logo-icon">🎙️</div>
        <div className="sidebar-logo-text">
          MeetingAI
          <small>Smart Assistant</small>
        </div>
      </div>

      {}
      <div className="sidebar-section-label">Workspace</div>

      <button
        className={`sidebar-nav-btn ${isActive('/') ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <span className="nav-icon">🏠</span>
        Dashboard
      </button>

      <button
        className={`sidebar-nav-btn ${isActive('/video') ? 'active' : ''}`}
        onClick={() => navigate('/video')}
      >
        <span className="nav-icon">📹</span>
        Video Meeting
      </button>

      <button
        className={`sidebar-nav-btn ${isActive('/messages') ? 'active' : ''}`}
        onClick={() => navigate('/messages')}
      >
        <span className="nav-icon">💬</span>
        Messages
      </button>

      <div className="sidebar-section-label" style={{ marginTop: 24 }}>Settings</div>
      <button
        className={`sidebar-nav-btn ${isActive('/profile') ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <span className="nav-icon">⚙️</span>
        Profile
      </button>

      {}
      <div className="sidebar-footer">
        <div className="server-status" style={{ marginBottom: 16 }}>
          <span className="status-dot connected" />
          Server connected
        </div>
        <LogoutButton />
      </div>
    </aside>
  )
}

function LogoutButton() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>👤 {user.name}</span>
      <button className="btn-ghost" onClick={logout} style={{ fontSize: '0.8rem', padding: '6px 0', justifyContent: 'flex-start' }}>
        Log Out
      </button>
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/meeting/:meetingId" element={<ProtectedRoute><MeetingDetail /></ProtectedRoute>} />
          <Route path="/video" element={<ProtectedRoute><VideoRoom /></ProtectedRoute>} />
          <Route path="/video/:roomId" element={<ProtectedRoute><VideoRoom /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}
