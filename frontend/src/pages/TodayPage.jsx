import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { daysSince, truncate, STAGE_LABELS, STAGE_COLORS } from '../lib/utils'
import ApplicationSlideOver from '../components/ApplicationSlideOver'
import AddApplicationModal from '../components/AddApplicationModal'
import AddContactModal from '../components/AddContactModal'

function getGreeting(name) {
  const hour = new Date().getHours()
  const first = name?.split(' ')[0] || name || ''
  if (hour >= 5 && hour < 12) return `Good morning, ${first}`
  if (hour >= 12 && hour < 17) return `Good afternoon, ${first}`
  if (hour >= 17 && hour < 22) return `Good evening, ${first}`
  return `Hey, ${first}`
}

export default function TodayPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({ overdue_contacts: [], stale_applications: [], pending_next_steps: [] })
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [showAddApp, setShowAddApp] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [snoozedIds, setSnoozedIds] = useState(new Set())
  const [snoozeOpenId, setSnoozeOpenId] = useState(null)

  useEffect(() => {
    function handleClickOutside() { setSnoozeOpenId(null) }
    if (snoozeOpenId) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [snoozeOpenId])

  async function handleSnooze(contactId, days) {
    try {
      await apiFetch(`/api/contacts/${contactId}/snooze`, {
        method: 'PATCH',
        body: JSON.stringify({ days }),
      }, token)
      setSnoozedIds(prev => new Set([...prev, contactId]))
    } catch (err) {
      console.error('Snooze failed', err)
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashResult, appsResult] = await Promise.all([
          apiFetch('/api/dashboard', {}, token),
          apiFetch('/api/applications', {}, token)
        ])
        setData({
          overdue_contacts: Array.isArray(dashResult.overdue_contacts) ? dashResult.overdue_contacts : [],
          stale_applications: Array.isArray(dashResult.stale_applications) ? dashResult.stale_applications : [],
          pending_next_steps: Array.isArray(dashResult.pending_next_steps) ? dashResult.pending_next_steps : [],
        })
        setApplications(Array.isArray(appsResult) ? appsResult : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  // Stat pill calculations
  const activeCount = applications.filter(a => !['offer', 'rejected'].includes(a.stage)).length
  const followUpCount = data.overdue_contacts.length
  const interviewingCount = applications.filter(a => a.stage === 'technical').length

  // Build unified action list
  const actions = [
    ...data.overdue_contacts
      .filter(c => !snoozedIds.has(c.id))
      .map(c => ({
      type: 'contact',
      id: c.id,
      label: `Follow up with ${c.name}`,
      sub: [c.company, c.role].filter(Boolean).join(' · '),
      badge: c.relationship_type,
      urgency: `${Math.floor(c.days_since_contact || 0)}d overdue`,
      urgencyColor: 'var(--overdue)',
      borderColor: 'var(--overdue)',
      onClick: () => navigate(`/contacts/${c.id}`),
    })),
    ...data.stale_applications.map(a => ({
      type: 'application',
      id: `app-${a.id}`,
      label: `Check on ${a.company}`,
      sub: a.role || '',
      badge: STAGE_LABELS[a.stage] || a.stage,
      badgeColor: STAGE_COLORS[a.stage],
      urgency: `No activity for ${Math.floor(daysSince(a.updated_at))}d`,
      urgencyColor: 'var(--text-muted)',
      borderColor: 'var(--border)',
      onClick: () => setSelectedApp(a)
    })),
    ...data.pending_next_steps.map(a => ({
      type: 'nextstep',
      id: `ns-${a.id}`,
      label: `Act on next step for ${a.company}`,
      sub: truncate(a.next_steps, 70),
      badge: STAGE_LABELS[a.stage] || a.stage,
      badgeColor: STAGE_COLORS[a.stage],
      urgency: `Updated ${Math.floor(daysSince(a.updated_at))}d ago`,
      urgencyColor: 'var(--text-muted)',
      borderColor: 'var(--border)',
      onClick: () => setSelectedApp(a)
    }))
  ]

  const isEmpty = actions.length === 0

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 760, width: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 6px', color: 'var(--text)' }}>
          {getGreeting(user?.name)}
        </h1>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{dateStr}</div>
      </div>

      {/* Stat Pills */}
      {!loading && !error && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <StatPill label="Active" value={activeCount} onClick={() => navigate('/applications')} />
          <StatPill label="Follow-ups Due" value={followUpCount} onClick={() => navigate('/contacts')} accent={followUpCount > 0} />
          <StatPill label="Interviewing" value={interviewingCount} onClick={() => navigate('/applications')} />
        </div>
      )}

      {loading && (
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
      )}

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '24px' }}>{error}</div>
      )}

      {/* Action List */}
      {!loading && !error && (
        <>
          {isEmpty ? (
            <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '60px' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
              <div style={{ color: 'var(--text)', fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                You are on top of everything.
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
                Nothing needs attention today.
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => navigate('/applications')}
                  style={ghostButtonStyle}
                >
                  View Applications
                </button>
                <button
                  onClick={() => navigate('/contacts')}
                  style={ghostButtonStyle}
                >
                  View Contacts
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '16px'
              }}>
                Needs attention
              </div>
              {actions.map(action => (
                <div
                  key={action.id}
                  className="today-card"
                  onClick={action.onClick}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    borderLeft: `3px solid ${action.borderColor}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px', color: 'var(--text)' }}>
                        {action.label}
                      </div>
                      {action.sub && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          {action.sub}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                      {action.badge && (
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '99px',
                          background: action.badgeColor ? action.badgeColor + '26' : 'rgba(255,255,255,0.05)',
                          color: action.badgeColor || 'var(--text-muted)',
                          fontWeight: 500,
                        }}>
                          {action.badge}
                        </span>
                      )}
                      {action.type === 'contact' && (
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              setSnoozeOpenId(snoozeOpenId === action.id ? null : action.id)
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              color: 'var(--text-muted)',
                              fontSize: '11px',
                              padding: '3px 8px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Snooze ▾
                          </button>
                          {snoozeOpenId === action.id && (
                            <div
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                marginTop: '4px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                zIndex: 50,
                                minWidth: '120px',
                                overflow: 'hidden',
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              {[
                                { label: '3 days', days: 3 },
                                { label: '7 days', days: 7 },
                                { label: 'Forever', days: null },
                              ].map(opt => (
                                <button
                                  key={opt.label}
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleSnooze(action.id, opt.days)
                                    setSnoozeOpenId(null)
                                  }}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '8px 14px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text)',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <span style={{ color: action.urgencyColor, fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {action.urgency}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Add */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={() => setShowAddApp(true)}
              style={ghostButtonStyle}
            >
              + Add Application
            </button>
            <button
              onClick={() => setShowAddContact(true)}
              style={ghostButtonStyle}
            >
              + Add Contact
            </button>
          </div>
        </>
      )}

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

      {showAddApp && (
        <AddApplicationModal
          token={token}
          onClose={() => setShowAddApp(false)}
          onSuccess={(newApp) => {
            setApplications(prev => [newApp, ...prev])
            setShowAddApp(false)
          }}
        />
      )}

      {showAddContact && (
        <AddContactModal
          token={token}
          applications={applications}
          onClose={() => setShowAddContact(false)}
          onSuccess={() => setShowAddContact(false)}
        />
      )}
    </div>
  )
}

function StatPill({ label, value, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: accent ? 'rgba(196,160,144,0.1)' : 'var(--bg-card)',
        border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '8px',
        padding: '12px 20px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s ease',
        minWidth: '120px',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = accent ? 'var(--accent)' : 'var(--border)'}
    >
      <div style={{ fontSize: '22px', fontWeight: 600, color: accent ? 'var(--accent)' : 'var(--text)', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
        {label}
      </div>
    </button>
  )
}

const ghostButtonStyle = {
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '8px 16px',
  color: 'var(--text-muted)',
  fontSize: '13px',
  cursor: 'pointer',
  transition: 'color 0.15s, border-color 0.15s',
}
