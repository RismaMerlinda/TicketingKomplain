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
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    updatePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean, message: string }>;
    updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const refresh = () => {
            const storedUser = localStorage.getItem("ticketing_user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        };

        refresh();
        setIsLoading(false);

        // Listen for internal and external (tab) updates
        window.addEventListener('authUpdated', refresh);
        window.addEventListener('storage', (e) => {
            if (e.key === 'ticketing_user') refresh();
        });

        return () => {
            window.removeEventListener('authUpdated', refresh);
            window.removeEventListener('storage', refresh as any);
        };
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('http://localhost:5900/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                const newUser: User = {
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role as UserRole,
                    productId: data.user.productId,
                    avatar: data.user.avatar
                };
                localStorage.setItem("ticketing_user", JSON.stringify(newUser));
                setUser(newUser);
                router.push("/dashboard");
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("ticketing_user");
        setUser(null);
        router.push("/login");
    };

    const updatePassword = async (oldPassword: string, newPassword: string) => {
        if (!user) return { success: false, message: "User not found" };

        const storedUsersStr = localStorage.getItem('ticketing_users');
        if (!storedUsersStr) return { success: false, message: "Storage error" };

        try {
            let users = JSON.parse(storedUsersStr);
            const userIndex = users.findIndex((u: any) => u.email === user.email);

            if (userIndex !== -1) {
                // Validate old password
                if (users[userIndex].password !== oldPassword) {
                    return { success: false, message: "Incorrect current password" };
                }

                users[userIndex].password = newPassword;
                localStorage.setItem('ticketing_users', JSON.stringify(users));
                return { success: true, message: "Password updated successfully" };
            }
        } catch (e) {
            console.error("Failed to update password", e);
        }
        return { success: false, message: "Failed to update password" };
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };

        // Update current session
        setUser(updatedUser);
        localStorage.setItem("ticketing_user", JSON.stringify(updatedUser));

        // Update permanent storage (ticketing_users)
        const storedUsersStr = localStorage.getItem('ticketing_users');
        if (storedUsersStr) {
            try {
                let users = JSON.parse(storedUsersStr);
                const userIndex = users.findIndex((u: any) => u.email === user.email);
                if (userIndex !== -1) {
                    users[userIndex] = { ...users[userIndex], ...updates };
                    localStorage.setItem('ticketing_users', JSON.stringify(users));
                }
            } catch (e) {
                console.error("Failed to update user in storage", e);
            }
        }

        // Notify other components for real-time update
        window.dispatchEvent(new Event('authUpdated'));
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updatePassword, updateUser }}>
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
