import { useState } from 'react'
import { apiFetch } from '../lib/api'

const STAGES = [
  { value: 'applied', label: 'Applied' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'technical', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

export default function AddApplicationModal({ onClose, onSuccess, token }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [stage, setStage] = useState('applied')
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0])
  const [resumeVersion, setResumeVersion] = useState('')
  const [companyError, setCompanyError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!company.trim()) {
      setCompanyError('Company name is required')
      return
    }
    setCompanyError('')
    setLoading(true)
    try {
      const newApp = await apiFetch('/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim() || undefined,
          stage,
          date_applied: dateApplied || undefined,
          resume_version: resumeVersion.trim() || undefined,
        })
      }, token)
      onSuccess(newApp)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bg-modal)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '32px',
        width: 'min(440px, calc(100vw - 32px))',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
          Add Application
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Company *</label>
          <input
            type="text"
            value={company}
            onChange={e => { setCompany(e.target.value); setCompanyError('') }}
            style={inputStyle}
            placeholder="Company name"
          />
          {companyError && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
              {companyError}
            </div>
          )}

          <label style={labelStyle}>Role</label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            style={inputStyle}
            placeholder="e.g. Software Engineer"
          />

          <label style={labelStyle}>Stage</label>
          <select
            value={stage}
            onChange={e => setStage(e.target.value)}
            style={selectStyle}
          >
            {STAGES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <label style={labelStyle}>Date Applied</label>
          <input
            type="date"
            value={dateApplied}
            onChange={e => setDateApplied(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Resume Version</label>
          <input
            type="text"
            value={resumeVersion}
            onChange={e => setResumeVersion(e.target.value)}
            style={inputStyle}
            placeholder="e.g. swe-v2"
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={ghostBtnStyle}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={primaryBtnStyle}>
              {loading ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </form>
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

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
}

const ghostBtnStyle = {
  padding: '8px 16px',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  color: 'var(--text-muted)',
  fontSize: '14px',
  cursor: 'pointer',
}

const primaryBtnStyle = {
  padding: '8px 16px',
  background: 'var(--accent)',
  border: 'none',
  borderRadius: '6px',
  color: '#1a1008',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
}
