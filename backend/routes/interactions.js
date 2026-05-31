const express = require('express')
const router = express.Router({ mergeParams: true })
const pool = require('../db')
const auth = require('../middleware/auth')

async function verifyContact(req, res) {
  const result = await pool.query(
    'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
    [req.params.contactId, req.user.id]
  )
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Contact not found' })
    return null
  }
  return result.rows[0]
}

// POST /api/contacts/:contactId/interactions
router.post('/', auth, async (req, res) => {
  try {
    const contact = await verifyContact(req, res)
    if (!contact) return

    const { note, interaction_date } = req.body
    if (!note) {
      return res.status(400).json({ error: 'note is required' })
    }

    const result = await pool.query(
      `INSERT INTO interactions (contact_id, user_id, note, interaction_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        req.params.contactId,
        req.user.id,
        note,
        interaction_date || new Date().toISOString().split('T')[0]
      ]
    )

    await pool.query(
      'UPDATE contacts SET last_contacted_at = NOW() WHERE id = $1',
      [req.params.contactId]
    )

    return res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/contacts/:contactId/interactions
router.get('/', auth, async (req, res) => {
  try {
    const contact = await verifyContact(req, res)
    if (!contact) return

    const result = await pool.query(
      `SELECT * FROM interactions
       WHERE contact_id = $1
       ORDER BY interaction_date DESC, created_at DESC`,
      [req.params.contactId]
    )
    return res.json(result.rows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/contacts/:contactId/interactions/:interactionId
router.delete('/:interactionId', auth, async (req, res) => {
  try {
    const contact = await verifyContact(req, res)
    if (!contact) return

    const { interactionId } = req.params
    const result = await pool.query(
      'DELETE FROM interactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [interactionId, req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interaction not found' })
    }
    return res.json({ deleted: parseInt(interactionId) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
