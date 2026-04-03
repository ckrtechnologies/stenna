import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sparkles, SlidersHorizontal } from 'lucide-react';

const MobileHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isCatalog = location.pathname === '/catalog';

    const handleMenuClick = () => {
        window.dispatchEvent(new CustomEvent('open-mega-menu'));
    };

    const handleSearchClick = () => {
        if (isCatalog) {
            window.dispatchEvent(new CustomEvent('toggle-catalog-search'));
        } else {
            navigate('/catalog?search-open=true');
        }
    };

    const handleFilterClick = () => {
        window.dispatchEvent(new CustomEvent('toggle-catalog-filter'));
    };

    return (
        <header className="mobile-header mobile-only">
            <div className="mobile-header-inner">
                {/* Left: Hamburger */}
                <div className="mobile-header-left">
                    <button
                        className="mobile-header-menu-btn"
                        onClick={handleMenuClick}
                        aria-label="Toggle Navigation"
                    >
                        <div className="zara-hamburger">
                            <span className="bar"></span>
                            <span className="bar"></span>
                        </div>
                    </button>
                </div>

                {/* Center: Logo */}
                <div className="mobile-header-logo">
                    <Link to="/">
                        <img src="/logo.png" alt="STENNA" className="mobile-logo-img" />
                    </Link>
                </div>

                {/* Right: Filter & Search */}
                <div className="mobile-header-right">
                    {isCatalog && (
                        <button className="mobile-header-icon-btn" onClick={handleFilterClick} aria-label="Filters">
                            <SlidersHorizontal size={22} strokeWidth={1.5} />
                        </button>
                    )}
                    <button className="mobile-header-icon-btn" onClick={handleSearchClick} aria-label="Search">
                        <Search size={22} strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;
