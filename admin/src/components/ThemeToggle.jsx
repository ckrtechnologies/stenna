import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ compact = false }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            className={`theme-toggle-btn ${compact ? 'compact' : ''}`}
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            {theme === 'light' ? <Moon size={compact ? 16 : 18} /> : <Sun size={compact ? 16 : 18} />}
            {!compact && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}

            <style>{`
                .theme-toggle-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    padding: 0.45rem 0.75rem;
                    color: var(--text-muted);
                    background: var(--bg-hover);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .theme-toggle-btn.compact {
                    padding: 0.4rem;
                    justify-content: center;
                }

                .theme-toggle-btn span {
                    margin-left: 0.6rem;
                    font-weight: 500;
                    font-size: 0.8rem;
                }

                .theme-toggle-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-main);
                    border-color: var(--primary);
                }
            `}</style>
        </button>
    );
};

export default ThemeToggle;
