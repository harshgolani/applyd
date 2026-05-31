import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { RELATIONSHIP_LABELS } from '../lib/utils'

const STAGES = [
  { value: 'applied', label: 'Applied' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'technical', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

export default function ApplicationSlideOver({ application, onClose, onUpdate, onArchive, onUnarchive, onDelete, token }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    company: application.company || '',
    role: application.role || '',
    stage: application.stage || 'applied',
    date_applied: application.date_applied ? application.date_applied.split('T')[0] : new Date().toISOString().split('T')[0],
    resume_version: application.resume_version || '',
    notes: application.notes || '',
    next_steps: application.next_steps || '',
  })
  const [contacts, setContacts] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [saveError, setSaveError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const isArchived = application.archived === true

  useEffect(() => {
    async function fetchContacts() {
      try {
        const data = await apiFetch(`/api/applications/${application.id}`, {}, token)
        setContacts(Array.isArray(data.contacts) ? data.contacts : [])
      } catch {
        setContacts([])
      }
    }
    fetchContacts()
  }, [application.id, token])

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      const updated = await apiFetch(`/api/applications/${application.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      }, token)
      onUpdate(updated)
      setSavedMsg('Saved!')
      setTimeout(() => setSavedMsg(''), 2000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUnarchive() {
    setActionLoading(true)
    try {
      const updated = await apiFetch(`/api/applications/${application.id}/unarchive`, {
        method: 'PATCH',
      }, token)
      onUnarchive(updated)
    } catch {
      setActionLoading(false)
    }
  }

  async function handleArchive() {
    setActionLoading(true)
    try {
      await apiFetch(`/api/applications/${application.id}/archive`, {
        method: 'PATCH',
      }, token)
      onArchive()
    } catch {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      await apiFetch(`/api/applications/${application.id}`, {
        method: 'DELETE',
      }, token)
      onDelete()
    } catch {
      setActionLoading(false)
    }
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 99,
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        width: 'min(480px, 100vw)',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>{form.company}</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: '0 0 0 16px' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px', flex: 1 }}>
          <label style={labelStyle}>Company</label>
          <input
            value={form.company}
            onChange={e => handleChange('company', e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Role</label>
          <input
            value={form.role}
            onChange={e => handleChange('role', e.target.value)}
            style={inputStyle}
            placeholder="e.g. Software Engineer"
          />

          <label style={labelStyle}>Stage</label>
          <select
            value={form.stage}
            onChange={e => handleChange('stage', e.target.value)}
            style={selectStyle}
          >
            {STAGES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <label style={labelStyle}>Date Applied</label>
          <input
            type="date"
            value={form.date_applied}
            onChange={e => handleChange('date_applied', e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark', cursor: 'pointer' }}
          />

          <label style={labelStyle}>Resume Version</label>
          <input
            value={form.resume_version}
            onChange={e => handleChange('resume_version', e.target.value)}
            style={inputStyle}
            placeholder="e.g. swe-v2"
          />

          <label style={labelStyle}>Notes</label>
          <textarea
            value={form.notes}
            onChange={e => handleChange('notes', e.target.value)}
            style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
            placeholder="Notes about this application..."
          />

          <label style={labelStyle}>Next Steps</label>
          <input
            value={form.next_steps}
            onChange={e => handleChange('next_steps', e.target.value)}
            style={inputStyle}
            placeholder="What's the next action?"
          />

          {saveError && (
            <div style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '8px' }}>{saveError}</div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            {savedMsg && <span style={{ color: 'var(--accent)', fontSize: '13px' }}>{savedMsg}</span>}
          </div>

          <div style={{ marginTop: '32px' }}>
            <div style={sectionTitleStyle}>Contacts</div>
            {contacts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No contacts linked</div>
            ) : contacts.map(c => (
              <div
                key={c.id}
                onClick={() => navigate(`/contacts/${c.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 0',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{c.name}</span>
                <span style={relBadgeStyle}>{RELATIONSHIP_LABELS[c.relationship_type] || c.relationship_type}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ ...sectionTitleStyle, color: 'var(--danger)', marginBottom: '12px' }}>Danger Zone</div>
            {confirmDelete ? (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Are you sure? This cannot be undone.
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    style={{ ...dangerBtnStyle }}
                  >
                    Confirm delete
                  </button>
                  <button onClick={() => setConfirmDelete(false)} style={ghostBtnStyle}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : isArchived ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleUnarchive} disabled={actionLoading} style={ghostBtnStyle}>
                  Unarchive
                </button>
                <button onClick={() => setConfirmDelete(true)} style={dangerBtnStyle}>
                  Delete
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleArchive} disabled={actionLoading} style={ghostBtnStyle}>
                  Archive
                </button>
                <button onClick={() => setConfirmDelete(true)} style={dangerBtnStyle}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
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

const ghostBtnStyle = {
  padding: '7px 14px',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  color: 'var(--text-muted)',
  fontSize: '13px',
  cursor: 'pointer',
}

const dangerBtnStyle = {
  padding: '7px 14px',
  background: 'transparent',
  border: '1px solid var(--danger)',
  borderRadius: '6px',
  color: 'var(--danger)',
  fontSize: '13px',
  cursor: 'pointer',
}

const sectionTitleStyle = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '12px',
}

const relBadgeStyle = {
  fontSize: '11px',
  padding: '2px 8px',
  borderRadius: '99px',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-muted)',
}
