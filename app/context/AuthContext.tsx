"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL as API_URL } from "@/lib/api-config";


export type UserRole = "SUPER_ADMIN" | "PRODUCT_ADMIN";

export interface User {
    _id?: string;
    email: string;
    password?: string; // Simpan sementara di state untuk kemudahan (gunakan JWT di aplikasi production)
    name: string;
    role: UserRole;
    productId?: string; // Opsional, hanya untuk PRODUCT_ADMIN
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
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
        const refresh = async () => {
            const storedUser = localStorage.getItem("ticketing_user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);

                // Set data awal dari storage
                setUser(parsedUser);

                // Sinkronisasi data Profile (Name & Avatar) dari MongoDB collection 'profiles'
                try {
                    const res = await fetch(`${API_URL}/profiles/${parsedUser.email}`);
                    if (res.ok) {
                        const profileData = await res.json();
                        // Gabungkan display name dari profile ke user session
                        const userWithProfile = {
                            ...parsedUser,
                            name: profileData.displayName || parsedUser.name,
                            avatar: profileData.avatar || parsedUser.avatar
                        };
                        setUser(userWithProfile);
                        localStorage.setItem("ticketing_user", JSON.stringify(userWithProfile));
                    }
                } catch (e) {
                    console.error("Gagal sinkronisasi profil:", e);
                    // Tetap gunakan data lama jika fetch gagal
                }
            }
        };

        const init = async () => {
            await refresh();
            setIsLoading(false);
        };

        init();

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

    const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const cleanEmail = String(email).trim();
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: cleanEmail, password }),
            });

            if (!response.ok) {
                let errorMessage = "Login failed";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || response.statusText;
                    // Use warn for expected auth failures (401, 403) to avoid cluttering console with "errors"
                    if (response.status >= 400 && response.status < 500) {
                        console.warn("Login attempt failed:", errorMessage);
                    } else {
                        console.error("Login error:", errorMessage);
                    }
                } catch {
                    console.error("Login failed with status:", response.status);
                    errorMessage = `Login failed with status: ${response.status}`;
                }
                return { success: false, message: errorMessage };
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Expected JSON but got:", text.substring(0, 100));
                return { success: false, message: "Invalid server response format" };
            }

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
                return { success: true };
            } else {
                return { success: false, message: "Invalid server response" };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "Terjadi kesalahan koneksi" };
        }
    };

    const logout = () => {
        localStorage.removeItem("ticketing_user");
        setUser(null);
        router.push("/login");
    };

    const updatePassword = async (oldPassword: string, newPassword: string) => {
        if (!user) return { success: false, message: "User tidak ditemukan" };

        try {
            const res = await fetch(`${API_URL}/passwords/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                return { success: false, message: errorData.message || "Gagal update password" };
            }

            // Update local state jika perlu
            setUser({ ...user, password: newPassword });

            return { success: true, message: "Password berhasil diperbarui dan riwayat dicatat di database" };
        } catch (e) {
            console.error("Gagal update password:", e);
        }
        return { success: false, message: "Gagal memperbarui password" };
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;

        try {
            // Simpan HANYA Name/Avatar ke collection 'profiles' di MongoDB
            const res = await fetch(`${API_URL}/profiles/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    displayName: updates.name || user.name,
                    avatar: updates.avatar || user.avatar
                }),
            });

            if (!res.ok) throw new Error("Gagal update profil ke database");

            const updatedProfile = await res.json();

            // Update session UI
            const updatedUser = {
                ...user,
                name: updatedProfile.displayName,
                avatar: updatedProfile.avatar
            };

            setUser(updatedUser);
            localStorage.setItem("ticketing_user", JSON.stringify(updatedUser));

            // Notifikasi komponen lain
            window.dispatchEvent(new Event('authUpdated'));
        } catch (e) {
            console.error("Gagal update profil:", e);
        }
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
