import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const navLinkStyle = ({ isActive }) => ({
    display: 'block',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    textDecoration: 'none',
    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
    background: isActive ? 'rgba(196,160,144,0.08)' : 'transparent',
    fontWeight: isActive ? 500 : 400,
    transition: 'color 0.15s ease',
  })

  return (
    <div style={{
      width: '220px',
      minWidth: '220px',
      minHeight: '100vh',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ color: 'var(--accent)', fontSize: '20px', fontWeight: 600, marginBottom: '32px' }}>
        Applyd
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <NavLink to="/" end style={navLinkStyle}>Today</NavLink>
        <NavLink to="/applications" style={navLinkStyle}>Applications</NavLink>
        <NavLink to="/contacts" style={navLinkStyle}>Contacts</NavLink>
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
          {user?.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          {user?.email}
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            fontSize: '13px',
            padding: '7px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
