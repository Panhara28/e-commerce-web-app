import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import UserFormScreen from "@/screens/users/UserFormScreen";

export const metadata: Metadata = {
  title: "Edit User",
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <LayoutWrapper>
      <UserFormScreen mode="edit" slug={slug} />
    </LayoutWrapper>
  );
}
