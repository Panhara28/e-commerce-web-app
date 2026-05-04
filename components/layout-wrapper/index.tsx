"use client";

import { useEffect, useState } from "react";

import Asidebar from "../asidebar";
import CloseSidebarMobile from "../close-sidebar-mobile";
import MainLayout from "../main-layout";
import MobileHeader from "../mobile-header";
import Topbar from "../topbar";

export default function LayoutWrapper({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem("sidebar-collapsed") === "true");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background md:flex-row">
        <MobileHeader />
        <Asidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        />
        <MainLayout>
          <Topbar
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          />
          <CloseSidebarMobile />
          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 xl:px-10">
            {children}
            <div className="h-12" />
          </div>
        </MainLayout>
      </div>
    </>
  );
}
