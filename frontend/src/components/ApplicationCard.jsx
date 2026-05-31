import { STAGE_COLORS, daysSince } from '../lib/utils'

export default function ApplicationCard({ application, onClick }) {
  const count = parseInt(application.contact_count, 10) || 0
  const stageColor = STAGE_COLORS[application.stage] || '#7a6a65'

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text)' }}>
          {application.company}
        </span>
        {count > 0 && (
          <span style={{
            background: 'rgba(196,160,144,0.1)',
            color: 'var(--accent)',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '99px',
          }}>
            {count} {count === 1 ? 'contact' : 'contacts'}
          </span>
        )}
      </div>

      {application.role && (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>
          {application.role}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 500,
          padding: '2px 8px',
          borderRadius: '99px',
          background: stageColor + '26',
          color: stageColor,
        }}>
          {application.stage?.replace('_', ' ')}
        </span>
        {application.resume_version && (
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {application.resume_version}
          </span>
        )}
      </div>

      <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
        {daysSince(application.updated_at)}d ago
      </div>
    </div>
  )
}
