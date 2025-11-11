"use client";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1 w-full overflow-auto">{children}</main>
    </>
  );
}
