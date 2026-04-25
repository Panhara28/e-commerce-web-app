import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Storefront",
    template: "%s | Tsportcambodia",
  },
};

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
