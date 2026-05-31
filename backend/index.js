require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { initWebSocket } = require('./websocket')

const app = express()
const server = http.createServer(app)

app.set('trust proxy', 1)

app.use(cors({
  origin: ['http://localhost:5173', 'https://applyd.netlify.app'],
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/applications', require('./routes/applications'))
app.use('/api/contacts', require('./routes/contacts'))
app.use('/api/dashboard', require('./routes/dashboard'))

app.get('/', (req, res) => res.json({ status: 'ok' }))

initWebSocket(server)

const PORT = process.env.PORT || 3001
server.listen(PORT, () => console.log(`Applyd backend running on port ${PORT}`))
