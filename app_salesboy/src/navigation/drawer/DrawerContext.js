import React, { createContext, useContext, useState, useCallback } from 'react';

const DrawerContext = createContext({
  isOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {}
});

export function DrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const openDrawer = useCallback(() => {
    console.log('[DrawerContext] openDrawer called, setting isOpen=true');
    setIsOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    console.log('[DrawerContext] closeDrawer called, setting isOpen=false');
    setIsOpen(false);
  }, []);
  const toggleDrawer = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <DrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  return useContext(DrawerContext);
}
