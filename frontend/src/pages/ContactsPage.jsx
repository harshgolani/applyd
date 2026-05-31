import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import ContactCard from '../components/ContactCard'
import AddContactModal from '../components/AddContactModal'

export default function ContactsPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  async function fetchContacts() {
    try {
      const data = await apiFetch('/api/contacts', {}, token)
      setContacts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
    apiFetch('/api/applications', {}, token)
      .then(data => setApplications(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [token])

  function handleAddSuccess() {
    fetchContacts()
  }

  const overdueContacts = contacts.filter(c => c.is_overdue)

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
            Contacts
          </h1>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {contacts.length} total
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={primaryBtnStyle}
        >
          Add Contact
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '16px' }}>{error}</div>
      )}

      {overdueContacts.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={sectionHeaderStyle}>
            <span style={sectionTitleStyle}>Needs Follow-up</span>
            <span style={countBadgeStyle}>{overdueContacts.length}</span>
          </div>
          {overdueContacts.map(c => (
            <ContactCard key={c.id} contact={c} onClick={() => navigate(`/contacts/${c.id}`)} />
          ))}
        </div>
      )}

      <div>
        <div style={sectionHeaderStyle}>
          <span style={sectionTitleStyle}>All Contacts</span>
          <span style={countBadgeStyle}>{contacts.length}</span>
        </div>
        {contacts.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            No contacts yet. Add someone you've reached out to.
          </div>
        ) : contacts.map(c => (
          <ContactCard key={c.id} contact={c} onClick={() => navigate(`/contacts/${c.id}`)} />
        ))}
      </div>

      {showAddModal && (
        <AddContactModal
          token={token}
          applications={applications}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  )
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

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '16px',
}

const sectionTitleStyle = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
}

const countBadgeStyle = {
  background: 'rgba(196,160,144,0.1)',
  color: 'var(--accent)',
  fontSize: '11px',
  padding: '2px 8px',
  borderRadius: '99px',
}
