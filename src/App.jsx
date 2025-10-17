import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import NewsPage from './pages/NewsPage'
import './App.css'

function Navigation() {
  const location = useLocation()

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Dashboard</span>
        </Link>
        <Link 
          to="/news" 
          className={`nav-link ${location.pathname === '/news' ? 'active' : ''}`}
        >
          <span className="nav-icon">📰</span>
          <span className="nav-text">News</span>
        </Link>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router basename="/crypto-react">
      <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/news" element={<NewsPage />} />
      </Routes>
    </Router>
  )
}

export default App
