import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import UserListScreen from "@/screens/users/UserListScreen";

export const metadata: Metadata = {
  title: "Users",
};

export default function UsersPage() {
  return (
    <LayoutWrapper>
      <UserListScreen />
    </LayoutWrapper>
  );
}
