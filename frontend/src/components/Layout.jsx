import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', maxWidth: '100%' }}>
        {children}
      </main>
    </div>
  )
}
