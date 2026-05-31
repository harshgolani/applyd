import { useState } from 'react'
import { apiFetch } from '../lib/api'

const RELATIONSHIP_OPTIONS = [
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'hiring_manager', label: 'Hiring Manager' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' },
]

export default function AddContactModal({ onClose, onSuccess, token, applications }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [relationshipType, setRelationshipType] = useState('recruiter')
  const [applicationId, setApplicationId] = useState('')
  const [nameError, setNameError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('Name is required')
      return
    }
    setNameError('')
    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        relationship_type: relationshipType,
      }
      if (applicationId) payload.application_id = applicationId
      const newContact = await apiFetch('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token)
      onSuccess(newContact)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const safeApps = Array.isArray(applications) ? applications : []

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
        width: '440px',
        maxWidth: '90vw',
      }}>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
          Add Contact
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setNameError('') }}
            style={inputStyle}
            placeholder="Contact name"
          />
          {nameError && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{nameError}</div>
          )}

          <label style={labelStyle}>Company</label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            style={inputStyle}
            placeholder="Company name"
          />

          <label style={labelStyle}>Role</label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            style={inputStyle}
            placeholder="e.g. Recruiter, SWE"
          />

          <label style={labelStyle}>Relationship Type</label>
          <select
            value={relationshipType}
            onChange={e => setRelationshipType(e.target.value)}
            style={selectStyle}
          >
            {RELATIONSHIP_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <label style={labelStyle}>Link to Application</label>
          <select
            value={applicationId}
            onChange={e => setApplicationId(e.target.value)}
            style={selectStyle}
          >
            <option value="">None</option>
            {safeApps.map(a => (
              <option key={a.id} value={a.id}>
                {a.company}{a.role ? ` - ${a.role}` : ''}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={ghostBtnStyle}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={primaryBtnStyle}>
              {loading ? 'Adding...' : 'Add Contact'}
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
