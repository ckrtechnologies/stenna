import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const AdminLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const nextVal = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(nextVal));
      return nextVal;
    });
  };

  return (
    <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
