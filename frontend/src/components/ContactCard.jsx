import { RELATIONSHIP_LABELS, timeAgo } from '../lib/utils'

export default function ContactCard({ contact, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: contact.is_overdue ? '2px solid var(--overdue)' : '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = contact.is_overdue ? 'var(--overdue)' : 'var(--border)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontWeight: 500, fontSize: '14px' }}>{contact.name}</span>
        <span style={relBadgeStyle}>
          {RELATIONSHIP_LABELS[contact.relationship_type] || contact.relationship_type}
        </span>
      </div>

      {(contact.company || contact.role) && (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>
          {[contact.company, contact.role].filter(Boolean).join(' · ')}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Last contacted {timeAgo(contact.last_contacted_at)}
        </span>
        {contact.is_overdue && (
          <span style={overdueBadgeStyle}>OVERDUE</span>
        )}
      </div>

      {contact.application_company && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Re: {contact.application_company}
          {contact.application_role ? ` — ${contact.application_role}` : ''}
        </div>
      )}
    </div>
  )
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
