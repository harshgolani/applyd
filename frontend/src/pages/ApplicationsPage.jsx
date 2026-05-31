import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { STAGE_LABELS, STAGE_COLORS } from '../lib/utils'
import { useWebSocket } from '../hooks/useWebSocket'
import ApplicationCard from '../components/ApplicationCard'
import ApplicationSlideOver from '../components/ApplicationSlideOver'
import AddApplicationModal from '../components/AddApplicationModal'

const KANBAN_STAGES = ['applied', 'phone_screen', 'technical', 'offer']

export default function ApplicationsPage() {
  const { token } = useAuth()
  const [applications, setApplications] = useState([])
  const [archivedApplications, setArchivedApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [rejectedOpen, setRejectedOpen] = useState(false)
  const [archivedOpen, setArchivedOpen] = useState(false)

  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await apiFetch('/api/applications', {}, token)
        setApplications(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [token])

  const handleWsMessage = useCallback((message) => {
    const { type, data } = message
    if (type === 'application:created') {
      setApplications(prev => [data, ...prev])
    } else if (type === 'application:updated') {
      setApplications(prev => prev.map(a => a.id === data.id ? data : a))
      setSelectedApp(prev => prev?.id === data.id ? data : prev)
    } else if (type === 'application:archived') {
      setApplications(prev => prev.filter(a => a.id !== data.id))
      setArchivedApplications(prev =>
        prev.some(a => a.id === data.id) ? prev : [data, ...prev]
      )
      setSelectedApp(prev => prev?.id === data.id ? null : prev)
    } else if (type === 'application:deleted') {
      setApplications(prev => prev.filter(a => a.id !== data.id))
      setSelectedApp(prev => prev?.id === data.id ? null : prev)
    }
  }, [])

  useWebSocket(token, handleWsMessage)

  function handleUpdate(updated) {
    setApplications(prev => prev.map(a => a.id === updated.id ? updated : a))
    setSelectedApp(updated)
  }

  function handleArchive() {
    if (selectedApp) {
      setArchivedApplications(prev =>
        prev.some(a => a.id === selectedApp.id) ? prev : [selectedApp, ...prev]
      )
      setApplications(prev => prev.filter(a => a.id !== selectedApp.id))
    }
    setSelectedApp(null)
  }

  function handleDelete() {
    if (selectedApp) {
      setApplications(prev => prev.filter(a => a.id !== selectedApp.id))
    }
    setSelectedApp(null)
  }

  function handleAddSuccess(newApp) {
    setApplications(prev => [newApp, ...prev])
  }

  const rejectedApps = applications.filter(a => a.stage === 'rejected')
  const kanbanApps = applications.filter(a => a.stage !== 'rejected')

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '2rem 2.5rem', width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
            Applications
          </h1>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {applications.length} total
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={primaryBtnStyle}
        >
          Add Application
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '16px' }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', overflowY: 'visible', paddingBottom: '16px', flex: 1, alignItems: 'flex-start' }}>
        {KANBAN_STAGES.map(stage => {
          const stageApps = kanbanApps.filter(a => a.stage === stage)
          const color = STAGE_COLORS[stage]
          return (
            <div
              key={stage}
              style={{
                width: '260px',
                minWidth: '260px',
                flexShrink: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                }} />
                <span style={{ fontWeight: 500, fontSize: '14px' }}>
                  {STAGE_LABELS[stage]}
                </span>
                <span style={{
                  background: 'rgba(196,160,144,0.08)',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  padding: '1px 7px',
                  borderRadius: '99px',
                  marginLeft: 'auto',
                }}>
                  {stageApps.length}
                </span>
              </div>

              {stageApps.map(app => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onClick={() => setSelectedApp(app)}
                />
              ))}
            </div>
          )
        })}
      </div>

      <CollapsibleSection
        title="Rejected"
        count={rejectedApps.length}
        open={rejectedOpen}
        onToggle={() => setRejectedOpen(o => !o)}
      >
        {rejectedApps.map(app => (
          <ApplicationCard
            key={app.id}
            application={app}
            onClick={() => setSelectedApp(app)}
          />
        ))}
      </CollapsibleSection>

      {/* TODO: add GET /api/applications/archived endpoint in V2 */}
      <CollapsibleSection
        title="Archived"
        count={archivedApplications.length}
        open={archivedOpen}
        onToggle={() => setArchivedOpen(o => !o)}
      >
        {archivedApplications.map(app => (
          <ApplicationCard
            key={app.id}
            application={app}
            onClick={() => setSelectedApp(app)}
          />
        ))}
      </CollapsibleSection>

      {selectedApp && (
        <ApplicationSlideOver
          application={selectedApp}
          token={token}
          onClose={() => setSelectedApp(null)}
          onUpdate={handleUpdate}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      )}

      {showAddModal && (
        <AddApplicationModal
          token={token}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  )
}

function CollapsibleSection({ title, count, open, onToggle, children }) {
  return (
    <div style={{ marginTop: '24px' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          padding: '0',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: open ? '12px' : '0',
        }}
      >
        <span>{title}</span>
        <span style={{
          background: 'rgba(196,160,144,0.1)',
          color: 'var(--accent)',
          fontSize: '11px',
          padding: '1px 7px',
          borderRadius: '99px',
        }}>
          {count}
        </span>
        <span style={{
          fontSize: '10px',
          transition: 'transform 0.15s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block',
        }}>
          ▾
        </span>
      </button>
      {open && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {children}
        </div>
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
