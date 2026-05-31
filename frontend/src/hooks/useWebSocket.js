import { useEffect, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const WS_URL = API_URL.replace('http', 'ws')

export function useWebSocket(token, onMessage) {
  const wsRef = useRef(null)

  useEffect(() => {
    if (!token) return

    wsRef.current = new WebSocket(`${WS_URL}?token=${token}`)

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        onMessage(message)
      } catch (e) {
        console.error('WS parse error', e)
      }
    }

    wsRef.current.onerror = (e) => console.error('WS error', e)

    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [token])

  return wsRef
}
