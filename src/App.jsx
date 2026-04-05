import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import HistoryPage from './pages/HistoryPage'
import DashboardPage from './pages/DashboardPage'
import TrackingPage from './pages/TrackingPage'
import EODFormPage from './pages/EODFormPage'

function RequireAuth({ children }) {
  const { user } = useAuth()
  if (user === undefined) return null
  if (user === null) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><HistoryPage /></RequireAuth>} />
        <Route path="/today" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/day/:date" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/tracking" element={<RequireAuth><TrackingPage /></RequireAuth>} />
        <Route path="/eod" element={<RequireAuth><EODFormPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
