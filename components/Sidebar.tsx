"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Ticket,
    BarChart3,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ShieldCheck,
    Navigation,
    Activity,
    Layers
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SIDEBAR_ITEMS = [
    { label: "DASHBOARD", icon: LayoutDashboard, href: "/dashboard" },
    { label: "TICKET_HUB", icon: Ticket, href: "/tiket" },
    { label: "ANALYTICS", icon: BarChart3, href: "/laporan" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Desktop Dynamic Sidebar */}
            <aside
                className="fixed top-0 left-0 h-full bg-[#162B63]/80 backdrop-blur-3xl border-r border-white/10 z-40 w-64 hidden md:flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* Brand Logo - Impactful */}
                <div className="p-10 pb-12 border-b border-white/5 bg-gradient-to-br from-[#1B3A8A]/30 to-transparent flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#2EA9FF] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(46,169,255,0.4)] mb-4 relative overflow-hidden">
                        <Image
                            src="/logo_sidebar.png"
                            alt="Diraya Logo"
                            fill
                            className="object-contain p-2"
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-black text-white text-2xl tracking-tighter leading-none italic uppercase">DIRAYA</span>
                        <span className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.4em] mt-2">OS_GATEWAY</span>
                    </div>
                </div>

                {/* Nav System */}
                <div className="px-6 py-12 flex-1 overflow-y-auto scrollbar-hide">
                    <div className="px-4 mb-8">
                        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.5em] opacity-50">Interface Control</span>
                    </div>
                    <nav className="space-y-4">
                        {SIDEBAR_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-5 px-6 py-5 rounded-2xl transition-all group relative overflow-hidden ${isActive
                                        ? "bg-[#2EA9FF] text-white shadow-[0_15px_30px_rgba(46,169,255,0.3)] border border-[#4FC3F7]/50"
                                        : "text-[#CBD5E1] hover:text-[#00E5FF] hover:bg-white/5"
                                        }`}
                                >
                                    <item.icon size={22} className={isActive ? "text-white" : "text-[#94A3B8] group-hover:text-[#00E5FF] transition-colors"} />
                                    <span className="text-xs font-black tracking-[0.1em]">{item.label}</span>
                                    {isActive && (
                                        <motion.div layoutId="sidebar-active" className="absolute right-0 w-1.5 h-6 bg-white rounded-l-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Profile / System Control */}
                <div className="p-8 border-t border-white/5 space-y-8 bg-black/10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1B3A8A] to-[#0E1F4D] flex items-center justify-center border border-white/10 uppercase font-black text-sm text-white shadow-xl">
                                AD
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22C55E] rounded-full border-2 border-[#162B63] shadow-[0_0_10px_#22C55E]" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-black text-white truncate uppercase tracking-tight">Master_Admin</span>
                            <span className="text-[9px] font-black text-[#2EA9FF] tracking-widest uppercase opacity-70">Uplink Status: OK</span>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all font-black text-[10px] tracking-[0.3em] border border-red-500/20 uppercase"
                    >
                        <LogOut size={18} />
                        EXIT_GATEWAY
                    </Link>
                </div>
            </aside>

            {/* Mobile Nav Command Bar */}
            <div className="md:hidden fixed top-0 w-full bg-[#162B63]/90 backdrop-blur-2xl border-b border-white/10 p-5 flex items-center justify-between z-50 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2EA9FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#2EA9FF]/20 relative overflow-hidden">
                        <Image
                            src="/logo_sidebar.png"
                            alt="Diraya Logo"
                            fill
                            className="object-contain p-2"
                        />
                    </div>
                    <span className="font-black text-white tracking-widest text-lg italic italic">DIRAYA</span>
                </div>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-3 text-[#00E5FF] bg-[#1B3A8A] border border-white/10 rounded-xl active:scale-95 transition-all shadow-xl"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="md:hidden fixed inset-0 bg-[#0A1332]/95 backdrop-blur-xl z-[60]"
                        />
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="md:hidden fixed top-0 left-0 h-full w-[300px] bg-[#162B63] z-[70] p-10 border-r border-white/10 shadow-[20px_0_60px_rgba(0,0,0,0.8)] flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-16 px-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#2EA9FF] rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                                        <Image
                                            src="/logo_sidebar.png"
                                            alt="Diraya Logo"
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                    <span className="font-black text-white text-xl tracking-tighter uppercase italic">DIRAYA</span>
                                </div>
                                <button onClick={() => setMobileOpen(false)} className="p-2 text-[#94A3B8] hover:text-white transition-colors">
                                    <X size={32} />
                                </button>
                            </div>
                            <nav className="flex-1 space-y-4">
                                {SIDEBAR_ITEMS.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-5 p-6 rounded-[1.5rem] transition-all ${isActive
                                                ? "bg-[#2EA9FF] text-white shadow-2xl border border-white/20"
                                                : "text-[#CBD5E1] hover:bg-white/5"
                                                }`}
                                        >
                                            <item.icon size={26} className={isActive ? "text-white" : "text-[#94A3B8]"} />
                                            <span className="font-black text-xs tracking-[0.2em]">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                            <Link
                                href="/logout"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-center gap-4 p-6 rounded-[2rem] text-red-500 bg-red-500/10 mt-auto font-black text-xs tracking-[0.3em] border border-red-500/20 uppercase"
                            >
                                <LogOut size={24} />
                                <span>ABORT_SESSION</span>
                            </Link>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
