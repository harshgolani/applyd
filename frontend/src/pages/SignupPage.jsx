import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    let valid = true

    if (!name.trim()) {
      setNameError('Name is required')
      valid = false
    } else {
      setNameError('')
    }

    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address')
      valid = false
    } else {
      setEmailError('')
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      valid = false
    } else {
      setPasswordError('')
    }

    if (!valid) return

    setLoading(true)
    try {
      await signup(email, name, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      width: '100%',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '40px',
        width: '380px',
      }}>
        <div style={{ color: 'var(--accent)', fontSize: '28px', fontWeight: 600, textAlign: 'center', marginBottom: '4px' }}>
          Applyd
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
          Create your account
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setNameError('') }}
            style={inputStyle}
            placeholder="Your name"
          />
          {nameError && (
            <div style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '4px' }}>{nameError}</div>
          )}

          <label style={labelStyle}>Email</label>
          <input
            type="text"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError('') }}
            style={inputStyle}
            placeholder="you@example.com"
          />
          {emailError && (
            <div style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '4px' }}>{emailError}</div>
          )}

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setPasswordError('') }}
            style={inputStyle}
            placeholder="••••••••"
          />
          {passwordError && (
            <div style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '4px' }}>{passwordError}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={primaryBtnStyle}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--text-muted)',
  marginBottom: '6px',
  marginTop: '16px',
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  color: 'var(--text)',
  fontSize: '14px',
  outline: 'none',
}

const primaryBtnStyle = {
  width: '100%',
  marginTop: '24px',
  padding: '10px',
  background: 'var(--accent)',
  border: 'none',
  borderRadius: '6px',
  color: '#1a1008',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
}
