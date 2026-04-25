import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import RolesPermissionsScreen from "@/screens/roles-permissions/RolesPermissionsScreen";

export const metadata: Metadata = {
  title: "Roles & Permissions",
};

export default function RolesPermissionsPage() {
  return (
    <LayoutWrapper>
      <RolesPermissionsScreen />
    </LayoutWrapper>
  );
}
