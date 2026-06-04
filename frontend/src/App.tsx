import { Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { Dashboard } from './pages/Dashboard'
import { ResumeManager } from './pages/ResumeManager'
import { Editor } from './pages/Editor'
import { Templates } from './pages/Templates'
import { ImportExport } from './pages/ImportExport'
import { ExportRecords } from './pages/ExportRecords'
import { AiTools } from './pages/AiTools'
import { SettingsPage } from './pages/SettingsPage'
import { JobRecommendations } from './pages/JobRecommendations'

function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/resumes" element={<ResumeManager />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/import" element={<ImportExport />} />
        <Route path="/exports" element={<ExportRecords />} />
        <Route path="/ai" element={<AiTools />} />
        <Route path="/jobs" element={<JobRecommendations />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App