"use client";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </>
  );
}
