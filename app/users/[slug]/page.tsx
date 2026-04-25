import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout-wrapper";
import UserDetailScreen from "@/screens/users/UserDetailScreen";

export const metadata: Metadata = {
  title: "User Detail",
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <LayoutWrapper>
      <UserDetailScreen slug={slug} />
    </LayoutWrapper>
  );
}
