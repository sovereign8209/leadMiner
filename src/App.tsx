import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing'
import Tool from './pages/tool'
import ComingSoon from './pages/comingsoon'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Live pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/tool" element={<Tool />} />

        {/* 🚧 Under development — redirect all auth pages to coming soon */}
        <Route path="/login" element={<ComingSoon />} />
        <Route path="/signup" element={<ComingSoon />} />
        <Route path="/dashboard" element={<ComingSoon />} />
        <Route path="/admin" element={<ComingSoon />} />

        {/* 404 */}
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </BrowserRouter>
  )
}