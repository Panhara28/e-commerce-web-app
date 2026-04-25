import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import SettingsScreen from "@/screens/settings/SettingsScreen";

export const metadata: Metadata = {
  title: "Exchange Rate",
};

export default function ExchangeRateSettingsPage() {
  return (
    <LayoutWrapper>
      <SettingsScreen defaultTab="exchange" />
    </LayoutWrapper>
  );
}
