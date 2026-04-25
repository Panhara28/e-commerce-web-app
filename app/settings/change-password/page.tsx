import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import SettingsScreen from "@/screens/settings/SettingsScreen";

export const metadata: Metadata = {
  title: "Change Password",
};

export default function ChangePasswordSettingsPage() {
  return (
    <LayoutWrapper>
      <SettingsScreen defaultTab="security" />
    </LayoutWrapper>
  );
}
