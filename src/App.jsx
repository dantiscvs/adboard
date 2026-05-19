import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdsPage from './pages/AdsPage'
import CampaignPage from './pages/CampaignPage'
import AccountPage from './pages/AccountPage'
import AdminPage from './pages/AdminPage'
import AtsPage from './pages/AtsPage'

// Marketing / content pages (publicly accessible)
import ProductIndex from './pages/ProductIndex'
import ProductLP from './pages/ProductLP'
import BlogIndex from './pages/BlogIndex'
import BlogPost from './pages/BlogPost'
import KnowledgeIndex from './pages/KnowledgeIndex'
import KnowledgeArticle from './pages/KnowledgeArticle'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LegalPages from './pages/LegalPages'

function ProtectedRoute({ children }) {
  const user = useAuthStore(s => s.user)
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!user.isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const user = useAuthStore(s => s.user)

  return (
    <Routes>
      {/* Landing + auth */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Marketing / content — always public */}
      <Route path="/product" element={<ProductIndex />} />
      <Route path="/product/:slug" element={<ProductLP />} />
      <Route path="/blog" element={<BlogIndex />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/knowledge" element={<KnowledgeIndex />} />
      <Route path="/knowledge/:slug" element={<KnowledgeArticle />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/legal/:kind" element={<LegalPages />} />

      {/* Authenticated app */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ads"
        element={
          <ProtectedRoute>
            <Layout><AdsPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <Layout><CampaignPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ats"
        element={
          <ProtectedRoute>
            <Layout><AtsPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Layout><AccountPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Layout><AdminPage /></Layout>
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
