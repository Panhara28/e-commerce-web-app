import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import UserFormScreen from "@/screens/users/UserFormScreen";

export const metadata: Metadata = {
  title: "Create User",
};

export default function CreateUserPage() {
  return (
    <LayoutWrapper>
      <UserFormScreen mode="create" />
    </LayoutWrapper>
  );
}
