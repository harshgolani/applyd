const { WebSocket, WebSocketServer } = require('ws')
const jwt = require('jsonwebtoken')

const connections = new Map() // userId => Set<WebSocket>

function initWebSocket(server) {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const token = url.searchParams.get('token')

    if (!token) {
      ws.close(1008, 'Missing token')
      return
    }

    let user
    try {
      user = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      ws.close(1008, 'Invalid token')
      return
    }

    const userId = user.id
    ws.isAlive = true

    if (!connections.has(userId)) {
      connections.set(userId, new Set())
    }
    connections.get(userId).add(ws)

    ws.on('pong', () => { ws.isAlive = true })

    const removeWs = () => {
      const userConns = connections.get(userId)
      if (userConns) {
        userConns.delete(ws)
        if (userConns.size === 0) connections.delete(userId)
      }
    }

    ws.on('close', removeWs)
    ws.on('error', removeWs)
  })

  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        connections.forEach((set, uid) => {
          if (set.has(ws)) {
            set.delete(ws)
            if (set.size === 0) connections.delete(uid)
          }
        })
        ws.terminate()
        return
      }
      ws.isAlive = false
      ws.ping()
    })
  }, 30000)

  wss.on('close', () => clearInterval(pingInterval))
}

function broadcast(userId, event, data) {
  const userConns = connections.get(userId)
  if (!userConns) return
  const message = JSON.stringify({ event, data })
  userConns.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message)
    }
  })
}

module.exports = { initWebSocket, broadcast }
