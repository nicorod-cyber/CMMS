import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) setSidebarCollapsed(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Topbar sidebarCollapsed={sidebarCollapsed} />
      <Toaster richColors position="top-right" />

      <motion.main
        className={cn(
          'pt-16 min-h-screen transition-all duration-250',
          sidebarCollapsed ? 'pl-[72px]' : 'pl-[264px]'
        )}
      >
        <div className="p-6 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
