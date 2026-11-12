"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers ({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      { children }
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "12px 16px",
          },
          success: { iconTheme: { primary: "#22c55e", secondary: "#1e293b" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#1e293b" } },
        }}
      >

      </Toaster>
    </SessionProvider>
  )
}