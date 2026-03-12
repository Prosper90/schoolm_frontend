"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  const closeMobileSidebar = () => setIsMobileOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobileSidebar}
      />
      <Header onMenuToggle={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />

      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          "ml-0 md:ml-64",
          isSidebarCollapsed && "md:ml-20"
        )}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
