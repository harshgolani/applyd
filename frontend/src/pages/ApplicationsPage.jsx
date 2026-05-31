import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import { STAGE_LABELS, STAGE_COLORS } from '../lib/utils'
import { useWebSocket } from '../hooks/useWebSocket'
import ApplicationCard from '../components/ApplicationCard'
import ApplicationSlideOver from '../components/ApplicationSlideOver'
import AddApplicationModal from '../components/AddApplicationModal'

const STAGES = ['applied', 'phone_screen', 'technical', 'offer', 'rejected']

export default function ApplicationsPage() {
  const { token } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

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

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
  }

  return (
    <div>
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

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
        {STAGES.map(stage => {
          const stageApps = applications.filter(a => a.stage === stage)
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
