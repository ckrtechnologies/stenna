import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Layout, Sparkles, Camera, User } from 'lucide-react';

const MobileBottomNav = () => {
    const location = useLocation();
    
    // Hide bottom nav if we're in certain modes (like a full-screen visualizer if it exists)
    // For now, it stays persistent.

    return (
        <nav className="mobile-bottom-nav mobile-only">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                    <>
                        <Home size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span>HOME</span>
                    </>
                )}
            </NavLink>
            
            <NavLink to="/catalog" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                    <>
                        <Layout size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span>CATALOG</span>
                    </>
                )}
            </NavLink>

            <NavLink to="/ai-recommendations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                    <>
                        <Sparkles size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span>AI</span>
                    </>
                )}
            </NavLink>

            {location.pathname.startsWith('/wallpaper/') ? (
                <button 
                    className="nav-item"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-visualizer'))}
                    style={{ background: 'none', border: 'none', padding: 0 }}
                >
                    <Camera size={20} strokeWidth={2} />
                    <span>TRY</span>
                </button>
            ) : (
                <NavLink to="/try-it-on" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    {({ isActive }) => (
                        <>
                            <Camera size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span>TRY</span>
                        </>
                    )}
                </NavLink>
            )}

            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                    <>
                        <User size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span>YOU</span>
                    </>
                )}
            </NavLink>
        </nav>
    );
};

export default MobileBottomNav;
