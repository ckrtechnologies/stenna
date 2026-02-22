import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { X, Sparkles, Layout } from 'lucide-react'
import './styles/App.css'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider, useAuth } from './context/AuthContext'
import ZaraMenu from './components/ZaraMenu'

function Navbar() {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getInitials = (user) => {
    const name = user.user_metadata?.full_name || user.email;
    return name.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(true)} style={{ padding: '0' }}>
            <div className="zara-hamburger">
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </button>

          {/* <div className="logo">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>STENNA</Link>
          </div> */}

          <div className="nav-links desktop-only">
            {/* Keeping some minimal links or just icons for a Zara feel */}
            <Link to="/catalog" className="nav-item">CATALOG</Link>
            {/* <Link to="/try-it-on" className="nav-item nav-usp">
              <Sparkles size={14} className="usp-icon" /> TRY IT ON
            </Link> */}
            <Link to="/profile/enquiries" className="nav-item">
              ENQUIRIES
            </Link>
            {/* <Link to="/ai-recommendations" className="nav-item nav-usp">
              <Sparkles size={14} className="usp-icon" /> AI RECOMMEND
            </Link> */}
            {/* <Link to="/showcase" className="nav-item">SHOWCASE</Link> */}
            {user ? (
              <div className="user-nav-group" ref={dropdownRef}>
                <div
                  className="avatar"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  title={user.user_metadata?.full_name || user.email}
                >
                  {getInitials(user)}
                </div>

                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {user.user_metadata?.full_name || 'Stenna User'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {user.email}
                      </div>
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      Profile
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-item">LOG IN</Link>
            )}
          </div>

          <div className="mobile-tools mobile-only">
            {(location.pathname.includes('/catalog') || location.pathname.includes('/wallpaper/')) && (
              <>
                <button
                  className="mobile-filter-btn"
                  onClick={() => window.dispatchEvent(new CustomEvent('toggle-catalog-filter'))}
                >
                  FILTERS
                </button>
                <button
                  className="mobile-search-btn"
                  onClick={() => window.dispatchEvent(new CustomEvent('toggle-catalog-search'))}
                >
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>SEARCH</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <ZaraMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        signOut={handleLogout}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="container">
        <Navbar />

        <main style={{ minHeight: '70vh' }}>
          <AppRoutes />
        </main>

        {/* <footer style={{ marginTop: '4rem', padding: '2rem 5%', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-secondary)', width: '100%' }}>
          <div className="footer-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <p>&copy; 2026 Wallpaper Catalog. All rights reserved.</p>
            <div className="footer-links" style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact Us</a>
            </div>
          </div>
        </footer> */}
      </div>
    </AuthProvider>
  )
}

export default App