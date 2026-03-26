import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { X, Sparkles, Layout, Search } from 'lucide-react'
import './styles/App.css'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider, useAuth } from './context/AuthContext'
import ZaraMenu from './components/ZaraMenu'
import Footer from './components/Footer'
import MobileBottomNav from './components/MobileBottomNav'
import MobileHeader from './components/MobileHeader'
import './styles/MobileUX.css'

// Navbar component removed as per user request for minimalist layout.
// Navigation is now handled via ZaraMenu triggered from sidebars.


function App() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenMenu = () => setIsMenuOpen(true);
    window.addEventListener('open-mega-menu', handleOpenMenu);
    return () => window.removeEventListener('open-mega-menu', handleOpenMenu);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="container">
      <MobileHeader />
      <main className="main-content" style={{ minHeight: '100vh' }}>
        <AppRoutes />
      </main>

      <ZaraMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        signOut={handleLogout}
      />

      <MobileBottomNav />
    </div>
  )
}

export default App