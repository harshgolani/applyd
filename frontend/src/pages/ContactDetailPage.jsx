import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { RELATIONSHIP_LABELS } from '../lib/utils'
import ApplicationSlideOver from '../components/ApplicationSlideOver'

export default function ContactDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [contact, setContact] = useState(null)
  const [interactions, setInteractions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [savedNotes, setSavedNotes] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [logLoading, setLogLoading] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const notesRef = useRef('')

  useEffect(() => {
    async function fetchContact() {
      try {
        const data = await apiFetch(`/api/contacts/${id}`, {}, token)
        setContact(data)
        setInteractions(Array.isArray(data.interactions) ? data.interactions : [])
        setNotes(data.notes || '')
        notesRef.current = data.notes || ''
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchContact()
  }, [id, token])

  async function handleNotesBlur() {
    if (notes === notesRef.current) return
    try {
      await apiFetch(`/api/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      }, token)
      notesRef.current = notes
      setSavedNotes(true)
      setTimeout(() => setSavedNotes(false), 2000)
    } catch {}
  }

  async function handleLogInteraction(e) {
    e.preventDefault()
    if (!newNote.trim()) return
    setLogLoading(true)
    try {
      const interaction = await apiFetch(`/api/contacts/${id}/interactions`, {
        method: 'POST',
        body: JSON.stringify({ note: newNote.trim(), interaction_date: newDate }),
      }, token)
      setInteractions(prev => [interaction, ...prev])
      setNewNote('')
      setNewDate(new Date().toISOString().split('T')[0])
    } catch {}
    finally {
      setLogLoading(false)
    }
  }

  async function handleDeleteInteraction(interactionId) {
    try {
      await apiFetch(`/api/contacts/${id}/interactions/${interactionId}`, {
        method: 'DELETE',
      }, token)
      setInteractions(prev => prev.filter(i => i.id !== interactionId))
    } catch {}
  }

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
  }

  if (error) {
    return <div style={{ color: 'var(--danger)', fontSize: '14px' }}>{error}</div>
  }

  if (!contact) return null

  return (
    <div style={{ maxWidth: '640px' }}>
      <button
        onClick={() => navigate('/contacts')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '13px',
          cursor: 'pointer',
          padding: '0 0 20px',
          display: 'block',
        }}
      >
        ← Back to Contacts
      </button>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text)' }}>
          {contact.name}
        </h1>
        {(contact.company || contact.role) && (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>
            {[contact.company, contact.role].filter(Boolean).join(' · ')}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={relBadgeStyle}>
            {RELATIONSHIP_LABELS[contact.relationship_type] || contact.relationship_type}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Follow up every {contact.follow_up_days || 7} days
          </span>
          {contact.is_overdue && (
            <span style={overdueBadgeStyle}>OVERDUE</span>
          )}
        </div>
      </div>

      {contact.application_id && (
        <div
          onClick={async () => {
            try {
              const app = await apiFetch(`/api/applications/${contact.application_id}`, {}, token)
              setSelectedApp(app)
            } catch {}
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '28px',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          Re: {contact.application_company}
          {contact.application_role ? ` — ${contact.application_role}` : ''}
        </div>
      )}

      <div style={{ marginBottom: '36px' }}>
        <div style={sectionTitleStyle}>Notes</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
            }}
            placeholder="Add notes about this contact..."
          />
          {savedNotes && (
            <span style={{ position: 'absolute', bottom: '10px', right: '12px', color: 'var(--accent)', fontSize: '12px' }}>
              Saved
            </span>
          )}
        </div>
      </div>

      <div>
        <div style={sectionTitleStyle}>Interaction Log</div>

        <form onSubmit={handleLogInteraction} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              style={{ ...inputStyle, width: '160px', flexShrink: 0 }}
            />
          </div>
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', marginBottom: '10px' }}
            placeholder="What happened? What was said?"
          />
          <button
            type="submit"
            disabled={logLoading || !newNote.trim()}
            style={primaryBtnStyle}
          >
            {logLoading ? 'Logging...' : 'Log interaction'}
          </button>
        </form>

        {interactions.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No interactions logged yet.</div>
        ) : interactions.map(interaction => (
          <InteractionItem
            key={interaction.id}
            interaction={interaction}
            onDelete={() => handleDeleteInteraction(interaction.id)}
          />
        ))}
      </div>

      {selectedApp && (
        <ApplicationSlideOver
          application={selectedApp}
          token={token}
          onClose={() => setSelectedApp(null)}
          onUpdate={(updated) => setSelectedApp(updated)}
          onArchive={() => setSelectedApp(null)}
          onDelete={() => setSelectedApp(null)}
        />
      )}
    </div>
  )
}

function InteractionItem({ interaction, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '12px 0',
        borderBottom: '1px solid var(--border)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>
          {new Date(interaction.interaction_date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          })}
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text)' }}>{interaction.note}</div>
      </div>
      {hovered && (
        <button
          onClick={onDelete}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0 0 0 16px',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

const sectionTitleStyle = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '14px',
}

const relBadgeStyle = {
  fontSize: '11px',
  padding: '2px 8px',
  borderRadius: '99px',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-muted)',
}

const overdueBadgeStyle = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--overdue)',
  background: 'rgba(196,176,144,0.1)',
  padding: '2px 8px',
  borderRadius: '99px',
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  color: 'var(--text)',
  fontSize: '14px',
  outline: 'none',
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
