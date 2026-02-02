"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Cpu,
    ShieldCheck,
    Lock,
    User,
    ArrowRight,
    Zap,
    Activity,
    Globe,
    Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TechBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[#0A1332]" />
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(46,169,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(46,169,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Glowing Orbs */}
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 50, 0],
                y: [0, -30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#2EA9FF]/10 rounded-full blur-[120px]"
        />
        <motion.div
            animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                x: [0, -40, 0],
                y: [0, 60, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#00E5FF]/5 rounded-full blur-[140px]"
        />
    </div>
);

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [credentials, setCredentials] = useState({ username: "", password: "" });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate high-tech auth sequence
        setTimeout(() => {
            router.push("/dashboard");
        }, 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-inter selection:bg-[#2EA9FF] selection:text-white">
            <TechBackground />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md z-10"
            >
                {/* Brand Logo - Impactful Entry */}
                <div className="flex flex-col items-center mb-12">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                        className="w-24 h-24 bg-gradient-to-br from-[#2EA9FF] to-[#1B3A8A] rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_20px_50px_rgba(46,169,255,0.4)] border border-white/20 relative group"
                    >
                        <Cpu className="text-white group-hover:scale-110 transition-transform" size={48} />
                        <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] animate-ping opacity-20" />
                    </motion.div>
                    <div className="text-center">
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic mb-4">
                            DIRAYA <span className="text-[#00E5FF] not-italic">OS</span>
                        </h1>
                        <p className="text-[#94A3B8] font-bold text-[10px] uppercase tracking-[0.5em] opacity-60">Authentication Required</p>
                    </div>
                </div>

                {/* Login Form Surface */}
                <div className="bg-[#162B63]/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2EA9FF] to-transparent opacity-50" />

                    <form onSubmit={handleLogin} className="space-y-10 relative z-10">
                        <div className="space-y-8">
                            {/* Identity Node */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.3em] ml-2 block opacity-50">Identity_Node</label>
                                <div className="relative group/input">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2EA9FF] group-focus-within/input:text-[#00E5FF] transition-colors">
                                        <User size={22} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="ADMIN_USERNAME"
                                        value={credentials.username}
                                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                        className="w-full pl-16 pr-8 py-6 bg-[#0A1332]/80 border border-white/10 rounded-2xl focus:outline-none focus:border-[#2EA9FF] text-white font-bold placeholder-white/5 transition-all text-lg tracking-tight"
                                    />
                                </div>
                            </div>

                            {/* Access Protocol */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.3em] ml-2 block opacity-50">Access_Protocol</label>
                                <div className="relative group/input">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2EA9FF] group-focus-within/input:text-[#00E5FF] transition-colors">
                                        <Lock size={22} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        placeholder="SECURE_PASSPHRASE"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        className="w-full pl-16 pr-8 py-6 bg-[#0A1332]/80 border border-white/10 rounded-2xl focus:outline-none focus:border-[#2EA9FF] text-white font-bold placeholder-white/5 transition-all text-lg tracking-tight"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-5 h-5 border-2 border-white/10 rounded-md bg-[#0A1332] flex items-center justify-center group-hover:border-[#2EA9FF] transition-colors">
                                    <div className="w-2 h-2 bg-[#2EA9FF] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Persist Session</span>
                            </label>
                            <button type="button" className="text-[10px] font-black text-[#2EA9FF] hover:text-[#00E5FF] uppercase tracking-widest transition-colors">Reset Access</button>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full py-7 bg-gradient-to-r from-[#2EA9FF] to-[#1B3A8A] text-white rounded-[2rem] font-black tracking-[0.4em] uppercase shadow-[0_20px_50px_rgba(46,169,255,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group/btn overflow-hidden relative"
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-4"
                                    >
                                        <RefreshCw className="animate-spin" size={24} />
                                        <span>AUTHENTICATING...</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="static"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-4"
                                    >
                                        <ShieldCheck size={24} className="group-hover/btn:scale-110 transition-transform" />
                                        <span>ESTABLISH_UPLINK</span>
                                        <ArrowRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </form>
                </div>

                {/* Secure Badge */}
                <div className="mt-12 flex items-center justify-center gap-6 opacity-40">
                    <div className="flex items-center gap-2">
                        <Globe size={14} className="text-[#2EA9FF]" />
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Quantum Cryptography Active</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

const RefreshCw = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
    </svg>
);
