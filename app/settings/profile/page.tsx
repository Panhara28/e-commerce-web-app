import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import SettingsScreen from "@/screens/settings/SettingsScreen";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default function ProfileSettingsPage() {
  return (
    <LayoutWrapper>
      <SettingsScreen defaultTab="profile" />
    </LayoutWrapper>
  );
}
