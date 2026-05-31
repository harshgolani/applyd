import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ isOpen, onClose }) {
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
    <div
      className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
      style={{
        width: '220px',
        minWidth: '220px',
        minHeight: '100vh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        padding: '24px 16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ color: 'var(--accent)', fontSize: '20px', fontWeight: 600 }}>
          Applyd
        </div>
        {isOpen && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: 0 }}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <NavLink to="/" end style={navLinkStyle} onClick={onClose}>Today</NavLink>
        <NavLink to="/applications" style={navLinkStyle} onClick={onClose}>Applications</NavLink>
        <NavLink to="/contacts" style={navLinkStyle} onClick={onClose}>Contacts</NavLink>
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
