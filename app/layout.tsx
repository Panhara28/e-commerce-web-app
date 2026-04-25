import type { Metadata } from "next";
import AppToaster from "@/components/ui/app-toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dashboard | Tsportcambodia",
    template: "%s | Tsportcambodia",
  },
  description: "Tsportcambodia admin dashboard",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
