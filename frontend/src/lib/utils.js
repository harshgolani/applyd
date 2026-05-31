export function timeAgo(dateStr) {
  if (!dateStr) return 'Never'
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function daysSince(dateStr) {
  if (!dateStr) return 0
  return Math.floor((new Date() - new Date(dateStr)) / 86400000)
}

export function truncate(str, n = 80) {
  return str && str.length > n ? str.slice(0, n) + '...' : str
}

export const STAGE_LABELS = {
  applied: 'Applied',
  phone_screen: 'Phone Screen',
  technical: 'Technical',
  offer: 'Offer',
  rejected: 'Rejected'
}

export const STAGE_COLORS = {
  applied: '#c4a090',
  phone_screen: '#8aaec4',
  technical: '#8ac4b0',
  offer: '#8ac490',
  rejected: '#c48a90'
}

export const RELATIONSHIP_LABELS = {
  recruiter: 'Recruiter',
  engineer: 'Engineer',
  hiring_manager: 'Hiring Manager',
  referral: 'Referral',
  other: 'Other'
}
