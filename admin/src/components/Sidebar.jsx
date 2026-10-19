import React, { useState } from 'react';
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
  Wand2,
  Cpu,
  Sparkles,
  FileText,
  TrendingUp,
  Store,
  MapPin,
  Building2,
  CalendarCheck,
  UserCheck,
  History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (label) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const menuGroups = [
    {
      items: [
        { title: 'Dashboard', icon: <LayoutDashboard size={15} />, path: '/', slug: 'dashboard', solidColor: '#059669' },
      ]
    },
    {
      label: 'Wallpapers',
      items: [
        { title: 'Groups', icon: <Layers size={15} />, path: '/groups', slug: 'groups', solidColor: '#4f46e5' },
        { title: 'Categories', icon: <Layers size={15} />, path: '/categories', slug: 'categories', solidColor: '#7c3aed' },
        { title: 'Wallpapers', icon: <ImageIcon size={15} />, path: '/wallpapers', slug: 'wallpapers', solidColor: '#0d9488' },
      ]
    },
    {
      label: 'Marketing & Dealers',
      items: [
        { title: 'Dealers', icon: <Users size={15} />, path: '/dealers', slug: 'dealers', solidColor: '#2563eb' },
        { title: 'Books', icon: <BookOpen size={15} />, path: '/books', slug: 'books', solidColor: '#e11d48' },
        { title: 'Generate PDF', icon: <FileText size={15} />, path: '/generate-pdf', slug: 'generate-pdf', solidColor: '#d97706' },
        { title: 'Leads', icon: <Mail size={15} />, path: '/leads', slug: 'leads', solidColor: '#ea580c' },
      ]
    },
    {
      label: 'Sales Tracking',
      items: [
        { title: 'Sales Dashboard', icon: <TrendingUp size={15} />, path: '/sales-tracking/dashboard', slug: 'sales-dashboard', solidColor: '#0284c7' },
        { title: 'Vendors / Shops', icon: <Store size={15} />, path: '/sales-tracking/vendors', slug: 'sales-vendors', solidColor: '#10b981' },
        { title: 'Shop History & Ledger', icon: <History size={15} />, path: '/sales-tracking/shop-history', slug: 'sales-history', solidColor: '#e11d48' },
        { title: 'Zone Master', icon: <MapPin size={15} />, path: '/sales-tracking/zones', slug: 'sales-zones', solidColor: '#9333ea' },
        { title: 'Market Master', icon: <Building2 size={15} />, path: '/sales-tracking/markets', slug: 'sales-markets', solidColor: '#0d9488' },
        { title: 'Sales Reps', icon: <UserCheck size={15} />, path: '/sales-tracking/sales-boys', slug: 'sales-boys', solidColor: '#3b82f6' },
        { title: 'Visit Records', icon: <CalendarCheck size={15} />, path: '/sales-tracking/visits', slug: 'sales-visits', solidColor: '#f59e0b' },
      ]
    },
    {
      label: 'Content Creation',
      items: [
        { title: 'Image Enhancer', icon: <Sparkles size={15} />, path: '/content/image-enhancer', slug: 'enhancer', solidColor: '#c026d3' },
      ]
    },
    {
      label: 'Platform & System',
      items: [
        { title: 'Inventory', icon: <Boxes size={15} />, path: '/inventory', slug: 'inventory', solidColor: '#0891b2' },
        { title: 'Users', icon: <Users size={15} />, path: '/users', slug: 'users', solidColor: '#047857' },
        { title: 'Store Info', icon: <Settings size={15} />, path: '/store', slug: 'settings', solidColor: '#475569' },
      ]
    }
  ];

  const renderMenuItem = (item) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`menu-item ${item.slug} ${isActive ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className="menu-squircle-badge"
          style={{
            backgroundColor: item.solidColor || 'var(--primary)',
            boxShadow: `0 2px 6px ${item.solidColor}33`,
          }}
        >
          {React.cloneElement(item.icon, { size: 15, color: '#ffffff', strokeWidth: 2.2 })}
        </div>
        <span className="menu-item-title">{item.title}</span>
      </Link>
    );
  };

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
          {menuGroups.map((group, gIdx) => {
            const isCollapsed = group.label ? !!collapsedGroups[group.label] : false;
            return (
              <div key={gIdx} className="menu-group">
                {group.label && (
                  <div 
                    className={`menu-category-header ${isCollapsed ? 'collapsed' : ''}`}
                    onClick={() => toggleGroup(group.label)}
                  >
                    <span className="menu-category-title">{group.label}</span>
                    <ChevronDown size={12} className="menu-category-chevron" />
                  </div>
                )}
                <div className={`menu-group-items ${isCollapsed ? 'collapsed' : ''}`}>
                  {group.items.map(renderMenuItem)}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <ThemeToggle />
          <button onClick={logout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
