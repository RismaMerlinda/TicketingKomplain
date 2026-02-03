"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validateUser } from "@/lib/auth";

export type UserRole = "SUPER_ADMIN" | "PRODUCT_ADMIN";

export interface User {
    email: string;
    name: string;
    role: UserRole;
    productId?: string; // Optional, only for PRODUCT_ADMIN
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check localStorage on mount
        const storedUser = localStorage.getItem("ticketing_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (email: string) => {
        const validUser = validateUser(email);

        if (validUser) {
            const newUser: User = {
                email: validUser.email,
                name: validUser.name,
                role: validUser.role as UserRole,
                productId: validUser.productId
            };
            localStorage.setItem("ticketing_user", JSON.stringify(newUser));
            setUser(newUser);
            router.push("/dashboard");
        } else {
            alert("Access Denied: Email not registered in the system.");
        }
    };

    const logout = () => {
        localStorage.removeItem("ticketing_user");
        setUser(null);
        router.push("/"); // Login page is at root or /login (Login page is /login but user might be at /)
        // Actually, let's check where the login page is.
        // Based on previous file reads, app/page.tsx is the landing page?
        // Wait, app/login/page.tsx is the login page.
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
