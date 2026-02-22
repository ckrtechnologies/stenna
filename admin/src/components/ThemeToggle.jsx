import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
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
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>

            <style jsx>{`
                .theme-toggle-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    padding: 0.875rem 1.25rem;
                    color: var(--text-muted);
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: var(--transition-base);
                    margin-bottom: 1rem;
                }

                .theme-toggle-btn span {
                    margin-left: 1rem;
                    font-weight: 600;
                    font-size: 0.9375rem;
                }

                .theme-toggle-btn:hover {
                    background: var(--border-highlight);
                    color: var(--text-main);
                    border-color: var(--primary);
                }
            `}</style>
        </button>
    );
};

export default ThemeToggle;
