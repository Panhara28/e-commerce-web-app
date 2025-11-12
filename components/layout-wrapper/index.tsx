"use client";

import Asidebar from "../asidebar";
import CloseSidebarMobile from "../close-sidebar-mobile";
import MainLayout from "../main-layout";
import MobileHeader from "../mobile-header";
import TabNavigation from "../tab-navigation";
import Topbar from "../topbar";

export default function LayoutWrapper({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <>
      <MobileHeader />
      {/* Sidebar */}
      <Asidebar />
      <MainLayout>
        {/* Top Bar */}
        <Topbar />
        {/* Tabs Navigation */}
        <TabNavigation />
        {/* Close Sidebar on Mobile when navigating */}
        <CloseSidebarMobile />
        <div className="px-20 md:px-20 py-4">{children}</div>
        {/* Hero Banner */}
        {/* Bottom Spacing */}
        <div className="h-12" />
      </MainLayout>
    </>
  );
}
