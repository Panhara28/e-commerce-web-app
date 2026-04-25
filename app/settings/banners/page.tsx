import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import SettingsScreen from "@/screens/settings/SettingsScreen";

export const metadata: Metadata = {
  title: "Banner Settings",
};

export default function BannerSettingsPage() {
  return (
    <LayoutWrapper>
      <SettingsScreen defaultTab="banners" />
    </LayoutWrapper>
  );
}
