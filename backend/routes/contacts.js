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
    THEN true ELSE false
  END as is_overdue`

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
    const { name, company, role, relationship_type, notes, follow_up_days } = req.body

    const existing = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    const result = await pool.query(
      `UPDATE contacts
       SET name              = COALESCE($1, name),
           company           = COALESCE($2, company),
           role              = COALESCE($3, role),
           relationship_type = COALESCE($4, relationship_type),
           notes             = COALESCE($5, notes),
           follow_up_days    = COALESCE($6, follow_up_days)
       WHERE id = $7 AND user_id = $8
       RETURNING *,
         CASE
           WHEN last_contacted_at IS NOT NULL
           AND EXTRACT(EPOCH FROM (NOW() - last_contacted_at))/86400 > follow_up_days
           THEN true ELSE false
         END as is_overdue`,
      [name, company, role, relationship_type, notes, follow_up_days, id, req.user.id]
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
