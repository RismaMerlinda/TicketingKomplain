"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, LogIn, User, Eye, EyeOff, KeyRound } from "lucide-react";
import ConfirmModal from "@/app/components/ConfirmModal";

// --- Components ---

// Background EXACTLY matching Landing Page (app/page.tsx)
const TechBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-blue-900" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
    </div>
);

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter(); // Keep for now in case
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showLoginError, setShowLoginError] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(formData.email, formData.password);
        if (!success) {
            setShowLoginError(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans text-white bg-[#0A1332]">
            <TechBackground />

            {/* Glowing Orbs EXACTLY matching Landing Page (app/page.tsx) */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[128px] mix-blend-screen animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] mix-blend-screen animate-pulse" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="z-10 w-full max-w-[480px] px-6 flex items-center justify-center min-h-screen"
            >
                {/* The "Timbul & Cerah" Premium Card */}
                <div className="relative w-full">
                    {/* Subtle Outer Glow */}

                    <div className="relative bg-[#FDFEFE] border border-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] p-10 md:pt-10 md:pb-14 md:px-14 overflow-hidden">

                        {/* Header */}
                        <div className="text-center mb-8 relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                                className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100"
                            >
                                <div className="relative">
                                    <User className="text-blue-500" size={48} />
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-sm border border-blue-50">
                                        <KeyRound className="text-cyan-500" size={18} />
                                    </div>
                                </div>
                            </motion.div>
                            <h1 className="text-4xl font-black tracking-tight text-[#0A1332] mb-3">
                                Welcome
                            </h1>
                            <p className="text-slate-500 text-sm font-medium">
                                Please sign in to the Ticketing Complaint System
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                            {/* Email Field - Clean & Timbul */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2">Email</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors duration-300">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="admin@gmail.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 text-[#0A1332] placeholder-slate-300 font-bold transition-all shadow-sm group-hover:shadow-md"
                                    />
                                </div>
                            </div>

                            {/* Password Field - Clean & Timbul */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors duration-300">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-14 pr-14 py-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 text-[#0A1332] placeholder-slate-300 font-bold transition-all shadow-sm group-hover:shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors"
                                    >
                                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button - PREMIUM ENHANCED */}
                            <button
                                className="w-full bg-[#1E3A8A] hover:bg-slate-900 text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-8 group/btn overflow-hidden relative font-sans border-b-4 border-blue-900/50"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="uppercase text-[14px]">Login</span>
                                    <LogIn size={20} className="group-hover:translate-x-2 transition-transform text-cyan-400" />
                                </div>
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>

            <ConfirmModal
                isOpen={showLoginError}
                onClose={() => setShowLoginError(false)}
                onConfirm={() => setShowLoginError(false)}
                title="Login Failed"
                message="The email or password you entered is incorrect. Please check your credentials and try again."
                confirmText="Try Again"
                variant="warning"
            />
        </div>
    );
}
