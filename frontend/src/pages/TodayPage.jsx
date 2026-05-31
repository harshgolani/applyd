import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { daysSince, truncate, STAGE_COLORS } from '../lib/utils'
import ApplicationSlideOver from '../components/ApplicationSlideOver'

export default function TodayPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({ overdue_contacts: [], stale_applications: [], pending_next_steps: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const result = await apiFetch('/api/dashboard', {}, token)
        setData({
          overdue_contacts: Array.isArray(result.overdue_contacts) ? result.overdue_contacts : [],
          stale_applications: Array.isArray(result.stale_applications) ? result.stale_applications : [],
          pending_next_steps: Array.isArray(result.pending_next_steps) ? result.pending_next_steps : [],
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [token])

  const isEmpty = data.overdue_contacts.length === 0 &&
    data.stale_applications.length === 0 &&
    data.pending_next_steps.length === 0

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 6px', color: 'var(--text)' }}>
          Good morning, {user?.name?.split(' ')[0] || user?.name}
        </h1>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{dateStr}</div>
      </div>

      {loading && (
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
      )}

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '14px' }}>{error}</div>
      )}

      {!loading && !error && isEmpty && (
        <div style={{ color: 'var(--text-muted)', marginTop: '80px', textAlign: 'center', fontSize: '15px' }}>
          Your job search is on track. Nothing needs attention today.
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <>
          {data.overdue_contacts.length > 0 && (
            <Section title="Overdue Follow-ups" count={data.overdue_contacts.length}>
              {data.overdue_contacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                  style={{ ...itemCardStyle, borderLeft: '2px solid var(--overdue)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--overdue)'}
                  onMouseLeave={e => { e.currentTarget.style.borderLeftColor = 'var(--overdue)'; e.currentTarget.style.borderColor = 'var(--overdue)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '3px' }}>{contact.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {[contact.company, contact.role].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                      <span style={relBadgeStyle}>{contact.relationship_type}</span>
                      <span style={{ color: 'var(--overdue)', fontSize: '12px' }}>
                        {Math.floor(contact.days_since_contact || 0)}d overdue
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </Section>
          )}

          {data.stale_applications.length > 0 && (
            <Section title="Stale Applications" count={data.stale_applications.length}>
              {data.stale_applications.map(app => {
                const stageColor = STAGE_COLORS[app.stage] || '#7a6a65'
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    style={itemCardStyle}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '3px' }}>{app.company}</div>
                        {app.role && <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{app.role}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          padding: '2px 8px',
                          borderRadius: '99px',
                          background: stageColor + '26',
                          color: stageColor,
                        }}>
                          {app.stage?.replace('_', ' ')}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          No activity for {Math.floor(daysSince(app.updated_at))}d
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </Section>
          )}

          {data.pending_next_steps.length > 0 && (
            <Section title="Pending Next Steps" count={data.pending_next_steps.length}>
              {data.pending_next_steps.map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  style={itemCardStyle}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '3px' }}>{app.company}</div>
                  {app.role && <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>{app.role}</div>}
                  {app.next_steps && (
                    <div style={{ color: 'var(--text)', fontSize: '13px', marginBottom: '4px' }}>
                      {truncate(app.next_steps, 80)}
                    </div>
                  )}
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    Updated {Math.floor(daysSince(app.updated_at))}d ago
                  </div>
                </div>
              ))}
            </Section>
          )}
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
    </div>
  )
}

function Section({ title, count, children }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          {title}
        </span>
        <span style={{
          background: 'rgba(196,160,144,0.1)',
          color: 'var(--accent)',
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '99px',
        }}>
          {count}
        </span>
      </div>
      {children}
    </div>
  )
}

const itemCardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '14px 16px',
  marginBottom: '8px',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease',
}

const relBadgeStyle = {
  fontSize: '11px',
  padding: '2px 8px',
  borderRadius: '99px',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-muted)',
}
