import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import SettingsScreen from "@/screens/settings/SettingsScreen";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingPage() {
  return (
    <LayoutWrapper>
      <SettingsScreen />
    </LayoutWrapper>
  );
}
