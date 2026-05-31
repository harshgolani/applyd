import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import TodayPage from './pages/TodayPage'
import ApplicationsPage from './pages/ApplicationsPage'
import ContactsPage from './pages/ContactsPage'
import ContactDetailPage from './pages/ContactDetailPage'

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AuthRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null
  if (token) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <AuthRoute><LoginPage /></AuthRoute>
      } />
      <Route path="/signup" element={
        <AuthRoute><SignupPage /></AuthRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout><TodayPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/applications" element={
        <ProtectedRoute>
          <Layout><ApplicationsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/contacts" element={
        <ProtectedRoute>
          <Layout><ContactsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/contacts/:id" element={
        <ProtectedRoute>
          <Layout><ContactDetailPage /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
