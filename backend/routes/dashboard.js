const express = require('express')
const router = express.Router()
const pool = require('../db')
const auth = require('../middleware/auth')

// GET /api/dashboard
router.get('/', auth, async (req, res) => {
  try {
    const [overdueResult, staleResult, nextStepsResult] = await Promise.all([
      pool.query(
        `SELECT c.*, a.company as application_company, a.role as application_role,
          EXTRACT(EPOCH FROM (NOW() - c.last_contacted_at))/86400 as days_since_contact
         FROM contacts c
         LEFT JOIN applications a ON c.application_id = a.id
         WHERE c.user_id = $1
           AND c.last_contacted_at IS NOT NULL
           AND EXTRACT(EPOCH FROM (NOW() - c.last_contacted_at))/86400 > c.follow_up_days
           AND (c.snoozed_until IS NULL OR c.snoozed_until < NOW())
         ORDER BY c.last_contacted_at ASC`,
        [req.user.id]
      ),
      pool.query(
        `SELECT * FROM applications
         WHERE user_id = $1
           AND archived = false
           AND stage NOT IN ('offer', 'rejected')
           AND updated_at < NOW() - INTERVAL '7 days'
         ORDER BY updated_at ASC`,
        [req.user.id]
      ),
      pool.query(
        `SELECT * FROM applications
         WHERE user_id = $1
           AND archived = false
           AND next_steps IS NOT NULL
           AND next_steps != ''
           AND updated_at < NOW() - INTERVAL '5 days'
         ORDER BY updated_at ASC`,
        [req.user.id]
      )
    ])

    return res.json({
      overdue_contacts: overdueResult.rows,
      stale_applications: staleResult.rows,
      pending_next_steps: nextStepsResult.rows
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
