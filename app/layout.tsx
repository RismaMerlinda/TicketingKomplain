import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diraya Tech - Ticketing System",
  description: "Internal Complaint Ticketing System for Diraya Tech",
  icons: {
    icon: "/logo_sidebar.png",
  },
};

import { AuthProvider } from "./context/AuthContext";
import RouteGuard from "./components/RouteGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased`}
      >
        <AuthProvider>
          <RouteGuard>
            {children}
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
