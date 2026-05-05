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
  Boxes,
  ChevronDown,
  Palette,
  Megaphone,
  Wand2,
  Cpu,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    'Wallpapers': false,
    'Marketing': false,
    'Content Creation': false,
    'System': false
  });

  const toggleGroup = (label) => {
    setExpandedGroups(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const menuGroups = [
    {
      items: [
        { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', slug: 'dashboard' },
      ]
    },
    {
      label: 'Wallpapers',
      icon: <Palette size={20} />,
      items: [
        { title: 'Groups', icon: <Layers size={20} />, path: '/groups', slug: 'groups' },
        { title: 'Categories', icon: <Layers size={20} />, path: '/categories', slug: 'categories' },
        { title: 'Wallpapers', icon: <ImageIcon size={20} />, path: '/wallpapers', slug: 'wallpapers' },
      ]
    },
    {
      label: 'Marketing',
      icon: <Megaphone size={20} />,
      items: [
        { title: 'Dealers', icon: <Users size={20} />, path: '/dealers', slug: 'dealers' },
        { title: 'Books', icon: <BookOpen size={20} />, path: '/books', slug: 'books' },
        { title: 'Leads', icon: <Mail size={20} />, path: '/leads', slug: 'leads' },
      ]
    },
    {
      label: 'Content Creation',
      icon: <Wand2 size={20} />,
      items: [
        { title: 'Image Enhancer', icon: <Sparkles size={20} />, path: '/content/image-enhancer', slug: 'enhancer' },
      ]
    },
    {
      label: 'System',
      icon: <Cpu size={20} />,
      items: [
        { title: 'Inventory', icon: <Boxes size={20} />, path: '/inventory', slug: 'inventory' },
        { title: 'Users', icon: <Users size={20} />, path: '/users', slug: 'users' },
        { title: 'Store Info', icon: <Settings size={20} />, path: '/store', slug: 'settings' },
      ]
    }
  ];

  return (
    <>
      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="logo">
          <img src="/logo.png" alt="Stenna Logo" className="logo-img" />
          <span>ADMIN</span>
        </div>
        <nav className="menu">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="menu-group">
              {group.label ? (
                <>
                  <div 
                    className={`menu-category ${!expandedGroups[group.label] ? 'collapsed' : ''}`}
                    onClick={() => toggleGroup(group.label)}
                  >
                    <div className="category-title">
                      {group.icon}
                      <span>{group.label}</span>
                    </div>
                    <ChevronDown size={14} className="chevron" />
                  </div>
                  <div className={`menu-group-items ${!expandedGroups[group.label] ? 'collapsed' : ''}`}>
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
                </>
              ) : (
                group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`menu-item ${item.slug} ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                ))
              )}
            </div>
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
