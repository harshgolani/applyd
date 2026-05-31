const express = require('express')
const router = express.Router()
const pool = require('../db')
const auth = require('../middleware/auth')
const { broadcast } = require('../websocket')

// POST /api/applications
router.post('/', auth, async (req, res) => {
  try {
    const { company, role, stage, date_applied, resume_version, notes, next_steps } = req.body
    if (!company) {
      return res.status(400).json({ error: 'company is required' })
    }

    const result = await pool.query(
      `INSERT INTO applications (user_id, company, role, stage, date_applied, resume_version, notes, next_steps)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        company,
        role || null,
        stage || 'applied',
        date_applied || null,
        resume_version || null,
        notes || null,
        next_steps || null
      ]
    )
    const newApplication = result.rows[0]
    broadcast(req.user.id, 'application:created', newApplication)
    return res.status(201).json(newApplication)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/applications
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*,
        (SELECT COUNT(*) FROM contacts c WHERE c.application_id = a.id) as contact_count
       FROM applications a
       WHERE a.user_id = $1 AND a.archived = false
       ORDER BY a.updated_at DESC`,
      [req.user.id]
    )
    return res.json(result.rows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/applications/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const appResult = await pool.query(
      'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const application = appResult.rows[0]
    const contactsResult = await pool.query(
      'SELECT * FROM contacts WHERE application_id = $1 ORDER BY created_at DESC',
      [id]
    )
    application.contacts = contactsResult.rows
    return res.json(application)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/applications/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { company, role, stage, date_applied, resume_version, notes, next_steps } = req.body

    const existing = await pool.query(
      'SELECT id FROM applications WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const result = await pool.query(
      `UPDATE applications
       SET company       = COALESCE($1, company),
           role          = COALESCE($2, role),
           stage         = COALESCE($3, stage),
           date_applied  = COALESCE($4, date_applied),
           resume_version = COALESCE($5, resume_version),
           notes         = COALESCE($6, notes),
           next_steps    = COALESCE($7, next_steps),
           updated_at    = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [company, role, stage, date_applied, resume_version, notes, next_steps, id, req.user.id]
    )
    const updatedApplication = result.rows[0]
    broadcast(req.user.id, 'application:updated', updatedApplication)
    return res.json(updatedApplication)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/applications/:id/archive
router.patch('/:id/archive', auth, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `UPDATE applications SET archived = true, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }
    const updatedApplication = result.rows[0]
    broadcast(req.user.id, 'application:archived', { id: parseInt(id) })
    return res.json(updatedApplication)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/applications/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }
    broadcast(req.user.id, 'application:deleted', { id: parseInt(id) })
    return res.json({ deleted: parseInt(id) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
