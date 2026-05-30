import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { InterviewPage } from './pages/InterviewPage'
import { LandingPage } from './pages/LandingPage'
import { LibraryPage } from './pages/LibraryPage'
import { ReportsPage } from './pages/ReportsPage'
import { CoachPage } from './pages/CoachPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/settings" element={<Navigate to="/coach" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
