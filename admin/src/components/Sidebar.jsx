import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Layers,
  Users,
  Settings,
  LogOut,
  Mail,
  Menu,
  X,
  BookOpen,
  Boxes
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', slug: 'dashboard' },
    { title: 'Groups', icon: <Layers size={20} />, path: '/groups', slug: 'groups' },
    { title: 'Categories', icon: <Layers size={20} />, path: '/categories', slug: 'categories' },
    { title: 'Wallpapers', icon: <ImageIcon size={20} />, path: '/wallpapers', slug: 'wallpapers' },
    { title: 'Dealers', icon: <Users size={20} />, path: '/dealers', slug: 'dealers' },
    { title: 'Books', icon: <BookOpen size={20} />, path: '/books', slug: 'books' },
    { title: 'Leads', icon: <Mail size={20} />, path: '/leads', slug: 'leads' },
    { title: 'Inventory', icon: <Boxes size={20} />, path: '/inventory', slug: 'inventory' },
    { title: 'Users', icon: <Users size={20} />, path: '/users', slug: 'users' },
    { title: 'Store Info', icon: <Settings size={20} />, path: '/store', slug: 'settings' },
  ];

  return (
    <>
      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="logo">
          <h2>Welcome <span>ADMIN</span></h2>
        </div>
        <nav className="menu">
          {menuItems.map((item) => (
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
        </nav>
        <div className="sidebar-footer">
          <ThemeToggle />
          <button onClick={logout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
