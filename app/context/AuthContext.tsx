"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Menggunakan 127.0.0.1 untuk menghindari issue localhost resolution di beberapa sistem Windows
const API_URL = "http://127.0.0.1:5900/api";

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

<<<<<<< HEAD
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
=======
    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            // Ambil daftar user dari database (Simple Auth)
            const res = await fetch(`${API_URL}/users`);
            if (!res.ok) {
                console.error("Gagal mengambil data user dari server");
                return false;
            }

            const users = await res.json();
            const foundUser = users.find((u: any) => u.email === email);

            if (foundUser && foundUser.password === password) {
                // Ambil data profil juga
                const profRes = await fetch(`${API_URL}/profiles/${email}`);
                let displayName = foundUser.name;
                let avatar = foundUser.avatar;

                if (profRes.ok) {
                    const profData = await profRes.json();
                    if (profData.displayName) displayName = profData.displayName;
                    if (profData.avatar) avatar = profData.avatar;
                }

                const userSession = { ...foundUser, name: displayName, avatar };
                setUser(userSession);
                localStorage.setItem("ticketing_user", JSON.stringify(userSession));
                router.push("/dashboard");
                return true;
            }
        } catch (error) {
            console.error("Login Error (Server Down?):", error);
>>>>>>> 970c36e (Fix: password update sync, build errors, and mongo db sync with backend routes)
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem("ticketing_user");
        setUser(null);
        router.push("/login");
    };

    const updatePassword = async (oldPassword: string, newPassword: string) => {
<<<<<<< HEAD
        if (!user) return { success: false, message: "User not found" };

        const storedUsersStr = localStorage.getItem('ticketing_users');
        if (!storedUsersStr) return { success: false, message: "Storage error" };
=======
        if (!user) return { success: false, message: "User tidak ditemukan" };
>>>>>>> 970c36e (Fix: password update sync, build errors, and mongo db sync with backend routes)

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
