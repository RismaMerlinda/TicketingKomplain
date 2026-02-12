import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"], // Comprehensive weights for better aesthetics
});

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
    <html lang="en" className={`${inter.variable}`}>
      <body
        className={`antialiased font-sans`}
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
