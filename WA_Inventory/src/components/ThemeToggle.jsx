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

            <style>{`
                .theme-toggle-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    padding: 0.65rem 1rem;
                    color: var(--text-muted);
                    background: var(--bg-input);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-bottom: 0.75rem;
                }

                .theme-toggle-btn span {
                    margin-left: 0.75rem;
                    font-weight: 500;
                    font-size: 0.875rem;
                }

                .theme-toggle-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-main);
                }
            `}</style>
        </button>
    );
};

export default ThemeToggle;
