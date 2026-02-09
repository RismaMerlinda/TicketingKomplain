"use client";

import { Bell, Search, Settings, Menu, User, LogOut, ShieldCheck, HelpCircle, CheckCircle, Smartphone, LayoutDashboard, Package, FileBarChart, Laptop, Terminal, X, ArrowRight, Ticket, Activity, Users } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getStoredLogs, formatRelativeTime, logActivity } from "@/lib/activity";
import { useRouter, usePathname } from "next/navigation";
import { ROLES } from "@/lib/auth";
import ConfirmModal from "./ConfirmModal";

interface SearchResult {
    id: string;
    title: string;
    description: string;
    category: 'page' | 'action' | 'product' | 'ticket';
    href: string;
    icon: any;
}

export default function Header({ title = "Overview", subtitle = "Operations Control Center", hideSearch = false }: { title?: string, subtitle?: string, hideSearch?: boolean }) {
    const { toggle } = useSidebar();
    const router = useRouter();
    const pathname = usePathname();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });

    const notifRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const { user, logout, updatePassword } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setIsSettingsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const refresh = () => {
            const allLogs = getStoredLogs();
            const filtered = allLogs.filter((log: any) => {
                if (user?.role === ROLES.PRODUCT_ADMIN && user?.productId) {
                    return log.product === user.productId;
                }
                return true;
            });
            setNotifications(filtered.slice(0, 8)); // Top 8

            // Calculate unread
            const lastRead = localStorage.getItem('ticketing_last_notif_read');
            const lastReadTs = lastRead ? parseInt(lastRead) : 0;
            const unread = filtered.filter((log: any) => log.timestamp > lastReadTs).length;
            setUnreadCount(unread);
        };
        refresh();
        window.addEventListener('activityUpdated', refresh);
        return () => window.removeEventListener('activityUpdated', refresh);
    }, [user]);

    const handleUpdatePassword = async () => {
        setPasswordError("");
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError("All fields are required");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        const result = await updatePassword(oldPassword, newPassword);
        if (result.success) {
            if (user) logActivity("Updated account password", user.name, user.productId);
            setSuccessModal({
                isOpen: true,
                title: "Password Updated",
                message: "Your account password has been successfully changed."
            });
            setIsPasswordModalOpen(false);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } else {
            setPasswordError(result.message);
        }
    };

    const toggleNotif = () => {
        if (!isNotifOpen) {
            // Marking as read
            localStorage.setItem('ticketing_last_notif_read', Date.now().toString());
            setUnreadCount(0);
        }
        setIsNotifOpen(!isNotifOpen);
    };


    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Click outside listener for search results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Global Search Index
    const searchIndex: SearchResult[] = useMemo(() => {
        const pages: SearchResult[] = [
            { id: 'dash', title: 'Dashboard', description: 'System overview and metrics', category: 'page', href: '/dashboard', icon: LayoutDashboard },
            { id: 'tix', title: 'Tickets', description: 'Manage and respond to support tickets', category: 'page', href: '/dashboard/tickets', icon: Ticket },
            { id: 'prod', title: 'Products', description: 'Catalog of supported software', category: 'page', href: '/dashboard/products', icon: Package },
            { id: 'rep', title: 'Reports', description: 'Analytics and data exports', category: 'page', href: '/dashboard/reports', icon: FileBarChart },
            { id: 'act', title: 'Activity Logs', description: 'System event tracking', category: 'page', href: '/dashboard/activity', icon: Activity },
            { id: 'pro', title: 'My Profile', description: 'Manage your account settings', category: 'page', href: '/dashboard/profile', icon: User },
            { id: 'adm', title: 'Product Admins', description: 'User management and permissions', category: 'page', href: '/dashboard/admins', icon: Users },
        ];

        const actions: SearchResult[] = [
            { id: 'new-tix', title: 'Create New Ticket', description: 'Submit a new issue to the system', category: 'action', href: '/dashboard/tickets', icon: Search },
            { id: 'help', title: 'Support Center', description: 'Get help with using the system', category: 'action', href: '#', icon: HelpCircle },
            { id: 'logout', title: 'Sign Out', description: 'Securely exit the dashboard', category: 'action', href: '#', icon: LogOut },
        ];

        // Add filter based on role if needed
        return [...pages, ...actions];
    }, []);

    // Filtered results
    const filteredResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.toLowerCase();
        return searchIndex.filter(item =>
            item.title.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term)
        );
    }, [searchTerm, searchIndex]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [searchTerm]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (isSearchFocused && filteredResults.length > 0) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % filteredResults.length);
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    const selected = filteredResults[selectedIndex];
                    if (selected) {
                        if (selected.href === '#') {
                            if (selected.id === 'logout') setIsLogoutOpen(true);
                        } else {
                            router.push(selected.href);
                        }
                        setIsSearchFocused(false);
                        setSearchTerm("");
                    }
                } else if (e.key === "Escape") {
                    setIsSearchFocused(false);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSearchFocused, filteredResults, selectedIndex, router]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Fallback to ticket search if no direct result selected but Enter pressed
        if (searchTerm.trim() && filteredResults.length === 0) {
            router.push(`/dashboard/tickets?search=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm("");
            setIsSearchFocused(false);
        } else if (filteredResults.length > 0) {
            const selected = filteredResults[selectedIndex];
            router.push(selected.href);
            setSearchTerm("");
            setIsSearchFocused(false);
        }
    };

    return (
        <header className="sticky top-0 z-30 w-full mb-0">
            {/* White Header Background with Glass Effect */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60" />

            <div className="relative h-16 px-6 flex items-center justify-between">

                {/* Left: Title & Breadcrumb vibe */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggle}
                        className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors md:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex flex-col justify-center">
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            {title}
                        </h1>
                        <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1500FF]" />
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-6">

                    {/* Modern Global Search */}
                    {!hideSearch && pathname === '/dashboard' && (
                        <div className="relative group hidden lg:block" ref={searchContainerRef}>
                            <form onSubmit={handleSearch} className="relative z-50">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className={`transition-colors ${isSearchFocused ? 'text-[#1500FF]' : 'text-slate-400'}`} size={16} />
                                </div>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    placeholder="Search system..."
                                    className={`pl-9 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1500FF]/5 focus:border-[#1500FF] transition-all w-80 shadow-sm ${isSearchFocused ? 'bg-white' : ''}`}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchTerm("")}
                                            className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* Global Search Results Dropdown */}
                            <AnimatePresence>
                                {isSearchFocused && searchTerm.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[60] py-4"
                                    >
                                        <div className="max-h-[400px] overflow-y-auto px-2">
                                            {filteredResults.length > 0 ? (
                                                <div className="space-y-4">
                                                    {/* Group results by category */}
                                                    {['page', 'product', 'ticket', 'action'].map(cat => {
                                                        const catResults = filteredResults.filter(r => r.category === cat);
                                                        if (catResults.length === 0) return null;

                                                        return (
                                                            <div key={cat} className="space-y-1">
                                                                <p className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat}s</p>
                                                                {catResults.map((result, idx) => {
                                                                    const globalIdx = filteredResults.indexOf(result);
                                                                    const isSelected = selectedIndex === globalIdx;

                                                                    return (
                                                                        <button
                                                                            key={result.id}
                                                                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                                            onClick={() => {
                                                                                router.push(result.href);
                                                                                setSearchTerm("");
                                                                                setIsSearchFocused(false);
                                                                            }}
                                                                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-left ${isSelected ? 'bg-[#1500FF]/5 ring-1 ring-[#1500FF]/10' : 'hover:bg-slate-50'}`}
                                                                        >
                                                                            <div className={`p-2.5 rounded-xl transition-colors ${isSelected ? 'bg-white text-[#1500FF] shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
                                                                                <result.icon size={18} />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{result.title}</p>
                                                                                <p className="text-xs text-slate-400 truncate font-medium">{result.description}</p>
                                                                            </div>
                                                                            {isSelected && <ArrowRight size={14} className="text-[#1500FF] animate-in slide-in-from-left-2" />}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="py-12 text-center text-slate-400 space-y-3">
                                                    <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                                                        <Search size={24} className="opacity-20" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-widest text-slate-300">No matching features found</p>
                                                        <p className="text-xs font-medium text-slate-400 mt-1">Try searching for 'tickets', 'reports', or 'profile'</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Footer for search */}
                                        <div className="mt-4 px-6 py-3 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 opacity-50">
                                                    <kbd className="px-1 py-0.5 rounded border border-slate-200 bg-white text-[9px] font-mono text-slate-400">↑↓</kbd>
                                                    <span className="text-[10px] font-bold text-slate-400">Navigate</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 opacity-50">
                                                    <kbd className="px-1 py-0.5 rounded border border-slate-200 bg-white text-[9px] font-mono text-slate-400">Enter</kbd>
                                                    <span className="text-[10px] font-bold text-slate-400">Select</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-black text-[#1500FF] uppercase tracking-tighter">Global System Search</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {!hideSearch && pathname === '/dashboard' && <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />}

                    {/* Action Icons */}
                    <div className="flex items-center gap-3">

                        {/* Settings Dropdown */}
                        <div className="relative" ref={settingsRef}>
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className={`relative p-2 rounded-lg transition-all group ${isSettingsOpen ? 'bg-[#1500FF]/10 text-[#1500FF]' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                            >
                                <Settings size={20} className={isSettingsOpen ? '' : 'group-hover:rotate-45 transition-transform duration-500'} />
                            </button>

                            <AnimatePresence>
                                {isSettingsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden overflow-y-auto max-h-[80vh]"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Quick Settings</p>
                                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <button onClick={() => { router.push('/dashboard/profile'); setIsSettingsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1500FF] transition-all">
                                                <User size={18} /> My Profile
                                            </button>
                                            <button
                                                onClick={() => { setIsPasswordModalOpen(true); setIsSettingsOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1500FF] transition-all"
                                            >
                                                <ShieldCheck size={18} /> Privacy & Security
                                            </button>
                                            <div className="h-px bg-slate-50 my-1" />
                                            <button
                                                onClick={() => { setIsLogoutOpen(true); setIsSettingsOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all"
                                            >
                                                <LogOut size={18} /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Notifications Dropdown */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={toggleNotif}
                                className={`relative p-2 rounded-lg transition-all group ${isNotifOpen ? 'bg-[#1500FF]/10 text-[#1500FF]' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                            >
                                <Bell size={20} className={isNotifOpen ? '' : 'group-hover:animate-swing'} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotifOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]"
                                    >
                                        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                                            <h3 className="font-extrabold text-slate-800 text-sm">Notifications</h3>
                                            <span className="px-2 py-0.5 bg-[#1500FF]/10 text-[#1500FF] text-[10px] font-bold rounded-full">New</span>
                                        </div>
                                        <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                                            {notifications.length > 0 ? (
                                                notifications.map((n, i) => (
                                                    <div key={i} className="px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                                        <p className="text-xs font-bold text-slate-700 group-hover:text-[#1500FF] transition-colors line-clamp-2">{n.text}</p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{formatRelativeTime(n.timestamp)}</span>
                                                            <span className="text-[10px] font-medium text-slate-400">By {n.user}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center text-slate-400">
                                                    <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                                    <p className="text-xs font-bold">No new notifications</p>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => { router.push('/dashboard/activity'); setIsNotifOpen(false); }}
                                            className="w-full py-3 bg-slate-50 text-[10px] font-extrabold text-slate-500 hover:text-[#1500FF] hover:bg-slate-100 transition-all uppercase tracking-widest border-t border-slate-100"
                                        >
                                            View All Activity
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
            {/* Change Password Modal */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setIsPasswordModalOpen(false); setPasswordError(""); }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm relative overflow-hidden p-8 border border-slate-100"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-[#1500FF]/5 text-[#1500FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-1">Security Update</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Change Account Password</p>
                            </div>

                            {passwordError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-[10px] font-black uppercase text-center tracking-wider"
                                >
                                    {passwordError}
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1 tracking-widest">Current Password</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#1500FF]/10 focus:border-[#1500FF] text-slate-800 font-bold transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1 tracking-widest">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#1500FF]/10 focus:border-[#1500FF] text-slate-800 font-bold transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1 tracking-widest">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#1500FF]/10 focus:border-[#1500FF] text-slate-800 font-bold transition-all text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-3 pt-4">
                                    <button onClick={handleUpdatePassword} className="w-full py-4 rounded-2xl bg-[#1500FF] text-white font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-slate-900 transition-all active:scale-[0.98]">
                                        Update Password
                                    </button>
                                    <button
                                        onClick={() => { setIsPasswordModalOpen(false); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordError(""); }}
                                        className="w-full py-4 rounded-2xl bg-rose-50 text-rose-500 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all active:scale-[0.98] shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Logout Confirmation */}
            <ConfirmModal
                isOpen={isLogoutOpen}
                onClose={() => setIsLogoutOpen(false)}
                onConfirm={logout}
                title="Are you sure?"
                message="You will be logged out of your dashboard session. Any unsaved changes might be lost."
                confirmText="Yes, Logout"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Success Modal */}
            <AnimatePresence>
                {successModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSuccessModal({ ...successModal, isOpen: false })}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">{successModal.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                                {successModal.message}
                            </p>
                            <button
                                onClick={() => setSuccessModal({ ...successModal, isOpen: false })}
                                className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
                            >
                                Continue
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    );
}
