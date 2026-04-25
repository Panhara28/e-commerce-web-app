"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          success: "!border-green-600 !bg-green-600 !text-white",
          error: "!border-red-600 !bg-red-600 !text-white",
          warning: "!border-amber-500 !bg-amber-500 !text-white",
          info: "!border-slate-900 !bg-slate-900 !text-white",
          title: "!text-white",
          description: "!text-white/90",
        },
      }}
    />
  );
}
