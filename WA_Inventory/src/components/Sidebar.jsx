import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import Button from './ui/Button';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuGroups = [
    {
      items: [
        { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', slug: 'dashboard' },
        { title: 'Enquiries', icon: <MessageSquare size={20} />, path: '/enquiries', slug: 'enquiries' },
      ]
    }
  ];

  return (
    <>


      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="logo">
          <img src="/logo.png" alt="Stenna Logo" className="logo-img" />
          <span>WA INVENTORY</span>
        </div>
        <nav className="menu">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="menu-group">
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`menu-item ${item.slug} ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <ThemeToggle />
          <Button onClick={logout} variant="ghost" className="logout-btn" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
