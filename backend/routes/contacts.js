const express = require('express')
const router = express.Router()
const pool = require('../db')
const auth = require('../middleware/auth')

const interactionRouter = require('./interactions')
router.use('/:contactId/interactions', interactionRouter)

const IS_OVERDUE_SQL = `
  CASE
    WHEN c.last_contacted_at IS NOT NULL
    AND EXTRACT(EPOCH FROM (NOW() - c.last_contacted_at))/86400 > c.follow_up_days
    AND (c.snoozed_until IS NULL OR c.snoozed_until < NOW())
    THEN true ELSE false
  END as is_overdue`

const IS_SNOOZED_SQL = `
  CASE
    WHEN c.snoozed_until IS NOT NULL AND c.snoozed_until > NOW()
    THEN true ELSE false
  END as is_snoozed`

// POST /api/contacts
router.post('/', auth, async (req, res) => {
  try {
    const { name, company, role, relationship_type, application_id, notes } = req.body
    if (!name) {
      return res.status(400).json({ error: 'name is required' })
    }

    if (application_id) {
      const appCheck = await pool.query(
        'SELECT id FROM applications WHERE id = $1 AND user_id = $2',
        [application_id, req.user.id]
      )
      if (appCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' })
      }
    }

    const result = await pool.query(
      `INSERT INTO contacts (user_id, application_id, name, company, role, relationship_type, last_contacted_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
       RETURNING *`,
      [
        req.user.id,
        application_id || null,
        name,
        company || null,
        role || null,
        relationship_type || 'other',
        notes || null
      ]
    )
    return res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/contacts
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
        ${IS_OVERDUE_SQL},
        ${IS_SNOOZED_SQL},
        a.company as application_company,
        a.role as application_role
       FROM contacts c
       LEFT JOIN applications a ON c.application_id = a.id
       WHERE c.user_id = $1
       ORDER BY c.last_contacted_at DESC NULLS LAST`,
      [req.user.id]
    )
    return res.json(result.rows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/contacts/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT c.*,
        ${IS_OVERDUE_SQL},
        ${IS_SNOOZED_SQL},
        a.company as application_company,
        a.role as application_role
       FROM contacts c
       LEFT JOIN applications a ON c.application_id = a.id
       WHERE c.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    const contact = result.rows[0]
    const interactionsResult = await pool.query(
      'SELECT * FROM interactions WHERE contact_id = $1 ORDER BY interaction_date DESC, created_at DESC',
      [id]
    )
    contact.interactions = interactionsResult.rows
    return res.json(contact)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/contacts/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params

    const existing = await pool.query(
      'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    const current = existing.rows[0]
    const body = req.body

    const name = 'name' in body ? (body.name || null) : current.name
    const company = 'company' in body ? (body.company || null) : current.company
    const role = 'role' in body ? (body.role || null) : current.role
    const relationship_type = 'relationship_type' in body ? (body.relationship_type || null) : current.relationship_type
    const notes = 'notes' in body ? (body.notes || null) : current.notes
    const follow_up_days = 'follow_up_days' in body ? (body.follow_up_days || null) : current.follow_up_days

    // application_id: if key present in body use it (null = unlink, id = link), otherwise keep current
    let application_id = current.application_id
    if ('application_id' in body) {
      if (body.application_id === null || body.application_id === '') {
        application_id = null
      } else {
        const appCheck = await pool.query(
          'SELECT id FROM applications WHERE id = $1 AND user_id = $2',
          [body.application_id, req.user.id]
        )
        if (appCheck.rows.length === 0) {
          return res.status(404).json({ error: 'Application not found' })
        }
        application_id = body.application_id
      }
    }

    const result = await pool.query(
      `UPDATE contacts
       SET name              = $1,
           company           = $2,
           role              = $3,
           relationship_type = $4,
           notes             = $5,
           follow_up_days    = $6,
           application_id    = $7
       WHERE id = $8 AND user_id = $9
       RETURNING *,
         CASE
           WHEN last_contacted_at IS NOT NULL
           AND EXTRACT(EPOCH FROM (NOW() - last_contacted_at))/86400 > follow_up_days
           THEN true ELSE false
         END as is_overdue`,
      [name, company, role, relationship_type, notes, follow_up_days, application_id, id, req.user.id]
    )
    return res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/contacts/:id/snooze
router.patch('/:id/snooze', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { days } = req.body // days: 3, 7, or null (forever)

    const existing = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    let snoozed_until
    if (days === null || days === undefined) {
      snoozed_until = '9999-12-31'
    } else {
      snoozed_until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    }

    const result = await pool.query(
      `UPDATE contacts SET snoozed_until = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [snoozed_until, id, req.user.id]
    )
    return res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/contacts/:id/unsnooze
router.patch('/:id/unsnooze', auth, async (req, res) => {
  try {
    const { id } = req.params
    const existing = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' })
    }
    const result = await pool.query(
      `UPDATE contacts SET snoozed_until = NULL WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
    )
    return res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/contacts/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' })
    }
    return res.json({ deleted: parseInt(id) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
