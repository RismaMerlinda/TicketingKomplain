"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        // Public routes that should not be accessible when logged in
        const authRoutes = ["/", "/login"];
        // Private routes that require authentication
        const isDashboardRoute = pathname.startsWith("/dashboard");

        if (user) {
            // If logged in and trying to access landing or login
            if (authRoutes.includes(pathname)) {
                router.push("/dashboard");
            }
        } else {
            // If NOT logged in and trying to access dashboard
            if (isDashboardRoute) {
                router.push("/login");
            }
        }
    }, [user, isLoading, pathname, router]);

    // Show nothing or a loader while determining auth state
    // We only show children if the state is "clean"
    // However, to keep it smooth, we can just return children and let useEffect handle the jump
    // But if we want to be strict, we hide children when we are about to redirect

    const isAuthRoute = ["/", "/login"].includes(pathname);
    const isDashboardRoute = pathname.startsWith("/dashboard");

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A1332]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Strict check to prevent content flash before redirect
    if (user && isAuthRoute) return null;
    if (!user && isDashboardRoute) return null;

    return <>{children}</>;
}
