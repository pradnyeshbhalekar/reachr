import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Outreach from './pages/Outreach'
import Admin from './pages/Admin'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/outreach" element={<Outreach />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  )
}
