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
  History,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  FolderMinus,
  FolderPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
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
        { title: 'Dashboard', icon: <LayoutDashboard size={13} />, path: '/', slug: 'dashboard', solidColor: '#059669' },
      ]
    },
    {
      label: 'Wallpapers',
      items: [
        { title: 'Groups', icon: <Layers size={13} />, path: '/groups', slug: 'groups', solidColor: '#4f46e5' },
        { title: 'Categories', icon: <Layers size={13} />, path: '/categories', slug: 'categories', solidColor: '#7c3aed' },
        { title: 'Wallpapers', icon: <ImageIcon size={13} />, path: '/wallpapers', slug: 'wallpapers', solidColor: '#0d9488' },
      ]
    },
    {
      label: 'Marketing & Dealers',
      items: [
        { title: 'Dealers', icon: <Users size={13} />, path: '/dealers', slug: 'dealers', solidColor: '#2563eb' },
        { title: 'Books', icon: <BookOpen size={13} />, path: '/books', slug: 'books', solidColor: '#e11d48' },
        { title: 'Generate PDF', icon: <FileText size={13} />, path: '/generate-pdf', slug: 'generate-pdf', solidColor: '#d97706' },
        { title: 'Leads', icon: <Mail size={13} />, path: '/leads', slug: 'leads', solidColor: '#ea580c' },
      ]
    },
    {
      label: 'Sales Operations',
      items: [
        { title: 'Sales Dashboard', icon: <TrendingUp size={13} />, path: '/sales-tracking/dashboard', slug: 'sales-dashboard', solidColor: '#0284c7' },
        { title: 'Field Visits Ledger', icon: <History size={13} />, path: '/sales-tracking/shop-history', slug: 'sales-history', solidColor: '#e11d48' },
        { title: 'Sales Reps', icon: <UserCheck size={13} />, path: '/sales-tracking/sales-boys', slug: 'sales-boys', solidColor: '#3b82f6' },
      ]
    },
    {
      label: 'Territory Masters',
      items: [
        { title: 'Zone Master', icon: <MapPin size={13} />, path: '/sales-tracking/zones', slug: 'sales-zones', solidColor: '#9333ea' },
        { title: 'Market Master', icon: <Building2 size={13} />, path: '/sales-tracking/markets', slug: 'sales-markets', solidColor: '#0d9488' },
        { title: 'Retail Shops', icon: <Store size={13} />, path: '/sales-tracking/vendors', slug: 'sales-vendors', solidColor: '#10b981' },
      ]
    },
    {
      label: 'Content Creation',
      items: [
        { title: 'Image Enhancer', icon: <Sparkles size={13} />, path: '/content/image-enhancer', slug: 'enhancer', solidColor: '#c026d3' },
      ]
    },
    {
      label: 'Platform & System',
      items: [
        { title: 'Inventory', icon: <Boxes size={13} />, path: '/inventory', slug: 'inventory', solidColor: '#0891b2' },
        { title: 'Users', icon: <Users size={13} />, path: '/users', slug: 'users', solidColor: '#047857' },
        { title: 'Store Info', icon: <Settings size={13} />, path: '/store', slug: 'settings', solidColor: '#475569' },
      ]
    }
  ];

  const categoryLabels = menuGroups.filter(g => g.label).map(g => g.label);
  const areAllCollapsed = categoryLabels.length > 0 && categoryLabels.every(l => !!collapsedGroups[l]);

  const toggleAllGroups = () => {
    if (areAllCollapsed) {
      setCollapsedGroups({});
    } else {
      const all = {};
      categoryLabels.forEach(l => { all[l] = true; });
      setCollapsedGroups(all);
    }
  };

  const renderMenuItem = (item) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`menu-item ${item.slug} ${isActive ? 'active' : ''} ${isCollapsed ? 'rail-mode' : ''}`}
        onClick={() => setIsOpen(false)}
        title={item.title}
      >
        <div
          className="menu-squircle-badge"
          style={{
            backgroundColor: item.solidColor || 'var(--primary)',
            boxShadow: `0 1px 4px ${item.solidColor}33`,
            width: isCollapsed ? '28px' : '22px',
            height: isCollapsed ? '28px' : '22px',
            borderRadius: '5px'
          }}
        >
          {React.cloneElement(item.icon, { size: isCollapsed ? 14 : 12, color: '#ffffff', strokeWidth: 2.2 })}
        </div>
        {!isCollapsed && <span className="menu-item-title">{item.title}</span>}
      </Link>
    );
  };

  return (
    <>
      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Logo and Collapse Toggle Header */}
        <div className="logo" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: isCollapsed ? '0.6rem 0.5rem' : '0.6rem 0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
            <img src="/logo.png" alt="Stenna Logo" className="logo-img" style={{ height: isCollapsed ? '24px' : '26px' }} />
            {!isCollapsed && (
              <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                ADMIN
              </span>
            )}
          </div>
          {onToggleCollapse && (
            <button
              type="button"
              className="sidebar-collapse-toggle-btn"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '5px',
                padding: '3px 4px',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
          )}
        </div>

        {/* Global Group Accordion Toggle (when expanded) */}
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.65rem 0.1rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Navigation
            </span>
            <button
              type="button"
              onClick={toggleAllGroups}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '0.65rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '1px 3px'
              }}
              title={areAllCollapsed ? 'Expand all categories' : 'Collapse all categories'}
            >
              {areAllCollapsed ? (
                <>
                  <FolderPlus size={11} />
                  <span>Expand</span>
                </>
              ) : (
                <>
                  <FolderMinus size={11} />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        )}

        <nav className="menu">
          {menuGroups.map((group, gIdx) => {
            const isGroupCollapsed = group.label ? !!collapsedGroups[group.label] : false;
            return (
              <div key={gIdx} className="menu-group">
                {group.label && !isCollapsed && (
                  <div 
                    className={`menu-category-header ${isGroupCollapsed ? 'collapsed' : ''}`}
                    onClick={() => toggleGroup(group.label)}
                  >
                    <span className="menu-category-title">{group.label}</span>
                    <ChevronDown size={11} className="menu-category-chevron" />
                  </div>
                )}
                {isCollapsed && group.label && (
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.4rem 0.5rem', opacity: 0.6 }} />
                )}
                <div className={`menu-group-items ${isGroupCollapsed && !isCollapsed ? 'collapsed' : ''}`}>
                  {group.items.map(renderMenuItem)}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer" style={{ padding: isCollapsed ? '0.4rem 0.3rem' : '0.4rem 0.65rem', gap: '0.35rem' }}>
          <ThemeToggle compact={isCollapsed} />
          <button onClick={logout} className="logout-btn" title="Logout" style={{ padding: isCollapsed ? '0.35rem' : '0.35rem 0.6rem', fontSize: '0.78rem' }}>
            <LogOut size={15} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
