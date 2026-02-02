"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const COLORS = {
    primary: "#0f172a",
    primaryLight: "#EEF1FF",
    accent: "#312e81",
    white: "#FFFFFF",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    text: "#1E293B",
    textMuted: "#64748B",
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
};

interface TicketActivity {
    note: string;
    timestamp: string;
}

interface NavItemProps {
    icon: string;
    label: string;
    active?: boolean;
    badge?: string;
    href?: string;
}

function NavItem({ icon, label, active, badge, href = "#" }: NavItemProps) {
    const getIcon = () => {
        switch (icon) {
            case "grid":
                return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
            case "ticket":
                return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
            case "user":
                return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
            case "chart":
                return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
            case "logout":
                return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
            default: return null;
        }
    };

    return (
        <Link
            href={href}
            className={`group relative flex w-full items-center justify-between px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-300 ${active
                ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border-l-2 border-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
        >
            <div className="flex items-center gap-3 relative z-10">
                <div className={`${active ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "text-slate-500 group-hover:text-white transition-colors"}`}>{getIcon()}</div>
                <span className="truncate tracking-wide">{label}</span>
            </div>
            {badge && (
                <span className={`px-1.5 py-0.5 text-[8px] font-semibold rounded ${active ? "bg-white text-[#0f172a]" : "bg-white/5 text-slate-500"
                    }`}>
                    {badge}
                </span>
            )}
        </Link>
    );
}

interface Ticket {
    id: string;
    title: string;
    customerName: string;
    customerContact: string;
    inputDate: string;
    deadline: string;
    priority: string;
    source: string;
    status: string;
    description: string;
    attachment?: string;
    createdAt: string;
    progressUpdates?: TicketActivity[];
}

function TicketsContent() {
    const searchParams = useSearchParams();
    const action = searchParams.get("action");

    const [menuOpen, setMenuOpen] = useState(false);
    const [view, setView] = useState<"list" | "create" | "detail">("list");
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [progressInput, setProgressInput] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        customerName: "",
        customerContact: "",
        inputDate: new Date().toISOString().split('T')[0],
        deadline: "",
        priority: "Medium",
        source: "WhatsApp",
        customSource: "",
        description: "",
        attachment: "",
    });

    useEffect(() => {
        const queryFilter = searchParams.get("filter");
        const querySearch = searchParams.get("search");

        setActiveFilter(queryFilter);
        if (querySearch) {
            setSearchQuery(querySearch);
        }

        if (action === "create") {
            setView("create");
        } else if (action === "detail") {
            const ticketId = searchParams.get("id");
            if (ticketId && tickets.length > 0) {
                const found = tickets.find(t => t.id === ticketId);
                if (found) {
                    setSelectedTicket(found);
                    setView("detail");
                } else {
                    setView("list");
                }
            } else if (ticketId) {
                // If tickets not loaded yet, wait for second effect
                setView("detail");
            }
        } else {
            setView("list");
        }
    }, [action, searchParams, tickets]);

    useEffect(() => {
        const stored = localStorage.getItem("orbit_tickets");
        if (stored) setTickets(JSON.parse(stored));
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.type === "image/jpeg" || file.type === "image/jpg")) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, attachment: reader.result as string }));
            reader.readAsDataURL(file);
        } else if (file) {
            alert("Hanya file JPG yang diperbolehkan!");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTicket: Ticket = {
            id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
            ...formData,
            source: formData.source === "Lainnya" ? formData.customSource : formData.source,
            status: "New",
            createdAt: new Date().toISOString(),
        };

        const updated = [newTicket, ...tickets];
        setTickets(updated);
        localStorage.setItem("orbit_tickets", JSON.stringify(updated));

        // Show Success Popup
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        setFormData({
            title: "", customerName: "", customerContact: "",
            inputDate: new Date().toISOString().split('T')[0],
            deadline: "", priority: "Medium",
            source: "WhatsApp", customSource: "", description: "", attachment: "",
        });
        setView("list");
    };

    const updateTicketField = (id: string, field: keyof Ticket, value: string) => {
        const updatedTickets = tickets.map(t => {
            if (t.id === id) {
                const updatedTicket = { ...t, [field]: value };
                if (selectedTicket?.id === id) setSelectedTicket(updatedTicket);
                return updatedTicket;
            }
            return t;
        });
        setTickets(updatedTickets);
        localStorage.setItem("orbit_tickets", JSON.stringify(updatedTickets));
        setIsEditingStatus(false);
    };

    const addProgressUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!progressInput.trim() || !selectedTicket) return;

        const newActivity: TicketActivity = {
            note: progressInput,
            timestamp: new Date().toISOString(),
        };

        const updatedTickets = tickets.map(t => {
            if (t.id === selectedTicket.id) {
                const updatedTicket = {
                    ...t,
                    progressUpdates: [newActivity, ...(t.progressUpdates || [])],
                    status: t.status === "New" ? "In Progress" : t.status // Auto-switch status if progress added
                };
                setSelectedTicket(updatedTicket);
                return updatedTicket;
            }
            return t;
        });

        setTickets(updatedTickets);
        localStorage.setItem("orbit_tickets", JSON.stringify(updatedTickets));
        setProgressInput("");
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "Urgent": return "bg-red-50 text-red-600 border-red-200";
            case "High": return "bg-orange-50 text-orange-600 border-orange-200";
            case "Medium": return "bg-blue-50 text-blue-600 border-blue-200";
            default: return "bg-slate-50 text-slate-600 border-slate-200";
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "New": return "bg-blue-50 text-blue-600 border-blue-100";
            case "In Progress": return "bg-amber-50 text-amber-600 border-amber-100";
            case "Done": return "bg-green-50 text-green-600 border-green-100";
            case "Closed": return "bg-slate-100 text-slate-500 border-slate-200";
            default: return "bg-slate-50 text-slate-500 border-slate-100";
        }
    };

    const filteredTickets = tickets.filter(t => {
        // First Apply Status/Deadline Filter
        let matchesFilter = true;
        if (activeFilter === "New") matchesFilter = (t.status === "Open" || t.status === "New");
        else if (activeFilter === "InProgress") matchesFilter = (t.status === "In Progress");
        else if (activeFilter === "Overdue") {
            if (!t.deadline) matchesFilter = false;
            else matchesFilter = new Date(t.deadline).getTime() < new Date().getTime() && t.status !== "Done" && t.status !== "Closed";
        }

        // Then Apply Search Query (Title, ID, or Customer)
        const matchesSearch =
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.customerName.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* MOBILE HEADER */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] md:hidden">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="12" r="4" fill="currentColor" />
                            </svg>
                        </div>
                        <div className="text-sm font-semibold text-slate-800">Tickets</div>
                    </div>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            <div className="flex">
                {/* SIDEBAR PRETTIER GRADIENT */}
                <aside className="hidden md:block w-64 h-screen sticky top-0 bg-gradient-to-b from-[#0f172a] via-[#0f172a] to-[#1e1b4b] border-r border-white/5 shrink-0 transition-all duration-300">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent_50%)]" />
                    <div className="relative z-10 h-full flex flex-col p-6">
                        <div className="flex items-center gap-3 mb-10 px-1">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] flex items-center justify-center shadow-lg shadow-slate-900/20">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
                                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                                </svg>
                            </div>
                            <div className="text-white">
                                <div className="text-[13px] font-bold tracking-widest leading-none uppercase">ORBIT</div>
                                <div className="text-[8px] font-semibold tracking-[0.2em] opacity-30 uppercase mt-1 text-slate-300">Management</div>
                            </div>
                        </div>

                        <nav className="flex-1 space-y-1.5">
                            <NavItem href="/AdminOrbit/dashboard" icon="grid" label="Dashboard" />
                            <NavItem href="/AdminOrbit/tickets" active icon="ticket" label="Tickets" badge={tickets.length.toString()} />
                            <NavItem href="/AdminOrbit/laporan" icon="chart" label="Laporan" />
                        </nav>
                        <div className="pt-6 border-t border-white/5">
                            <NavItem href="#" icon="logout" label="Logout" />
                        </div>
                    </div>
                </aside>

                <main className="flex-1 min-w-0 p-4 md:p-6">
                    {/* Elegant Header */}
                    <div className="bg-white border border-slate-100 rounded-2xl px-6 py-6 md:px-8 md:py-8 sticky top-0 z-30 shadow-sm">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Link href="/AdminOrbit/dashboard" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0f172a] hover:opacity-70 transition-opacity">
                                        Dashboard
                                    </Link>
                                    <span className="text-slate-300 text-xs">/</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Tickets</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
                                    Ticket <span className="text-[#0f172a]">Management</span>
                                </h1>
                            </div>

                            <div className="flex flex-1 max-w-xl mx-0 md:mx-6">
                                <div className="relative w-full group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400 group-focus-within:text-[#0f172a] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari judul, ID, atau nama pelanggan..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-[#0f172a] transition-all outline-none font-semibold text-sm text-slate-700 placeholder:font-medium placeholder:text-slate-300"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                {view === "list" ? (
                                    <button
                                        onClick={() => setView("create")}
                                        className="group flex items-center gap-2 px-5 py-2.5 bg-[#0f172a] text-white rounded-xl font-semibold shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/30 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                                    >
                                        <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                        Create Ticket
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setView("list");
                                            setSelectedTicket(null);
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all font-sans"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        Back to List
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto p-6 md:p-12">

                        {view === "list" ? (
                            /* BEAUTIFUL LIST VIEW */
                            <div className="animate-slide-up">
                                {activeFilter && (
                                    <div className="mb-8 flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-[#0f172a] rounded-xl flex items-center justify-center text-white">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Filter Aktif</p>
                                                <p className="text-sm font-semibold text-[#0f172a]">Menampilkan Tiket: {activeFilter}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setActiveFilter(null);
                                                window.history.replaceState({}, '', '/AdminOrbit/tickets');
                                            }}
                                            className="px-4 py-2 bg-white text-slate-500 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                                        >
                                            Hapus Filter ×
                                        </button>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredTickets.length === 0 ? (
                                        <div className="col-span-full py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
                                            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                            </div>
                                            <p className="text-sm font-medium">
                                                {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Tidak ada tiket komplain dengan filter ini."}
                                            </p>
                                            {searchQuery ? (
                                                <button onClick={() => setSearchQuery("")} className="mt-4 text-[#0f172a] font-semibold text-sm hover:underline">
                                                    Bersihkan pencarian
                                                </button>
                                            ) : (
                                                <button onClick={() => setView("create")} className="mt-4 text-[#0f172a] font-semibold text-sm hover:underline">
                                                    Buat tiket baru?
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        filteredTickets.map((t) => (
                                            <div key={t.id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex flex-col gap-2">
                                                        <div className={`w-fit px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-lg border ${getPriorityBadge(t.priority)}`}>
                                                            {t.priority}
                                                        </div>
                                                        <div className={`w-fit px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-lg border ${getStatusBadge(t.status)}`}>
                                                            ● {t.status}
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">{t.id}</span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-800 mb-1 group-hover:text-[#0f172a] transition-colors line-clamp-1">{t.title}</h3>
                                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10 leading-relaxed font-medium">{t.description}</p>

                                                <div className="space-y-3 pt-4 border-t border-slate-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-semibold text-slate-700">{t.customerName}</div>
                                                            <div className="text-[10px] font-medium text-slate-400">{t.customerContact}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            {new Date(t.inputDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {t.attachment && (
                                                                <div className="h-6 w-6 rounded-md bg-green-50 flex items-center justify-center text-green-500">
                                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                                                </div>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTicket(t);
                                                                    setView("detail");
                                                                }}
                                                                className="text-xs font-semibold text-[#0f172a] uppercase tracking-widest hover:translate-x-1 transition-transform"
                                                            >
                                                                View →
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : view === "create" ? (
                            /* BEAUTIFUL CREATE VIEW */
                            <div className="max-w-4xl mx-auto animate-slide-up">
                                <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                                    <div className="p-8 md:p-12">
                                        <div className="mb-10 flex items-center gap-4">
                                            <div className="h-12 w-12 bg-[#0f172a] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-semibold text-slate-800">Tiket Baru</h2>
                                                <p className="text-sm text-slate-400 font-medium">Lengkapi detail untuk membantu penyelesaian komplain.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            {/* Judul */}
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Judul Komplain</label>
                                                <input
                                                    required type="text"
                                                    placeholder="Gunakan kalimat singkat (Contoh: Menu Laporan sulit diakses)"
                                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#0f172a] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-semibold text-slate-700 placeholder:font-normal placeholder:text-slate-300"
                                                    value={formData.title}
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                />
                                            </div>

                                            {/* User Info */}
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Nama Pelanggan</label>
                                                <input
                                                    required type="text"
                                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#0f172a] transition-all outline-none font-semibold text-slate-700"
                                                    value={formData.customerName}
                                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Nomor Kontak</label>
                                                <input
                                                    required type="text"
                                                    placeholder="Masukan Nomor Kontak"
                                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#0f172a] transition-all outline-none font-semibold text-slate-700"
                                                    value={formData.customerContact}
                                                    onChange={e => setFormData({ ...formData, customerContact: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Tanggal Input</label>
                                                <input
                                                    required type="date"
                                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#0f172a] transition-all outline-none font-semibold text-slate-700"
                                                    value={formData.inputDate}
                                                    onChange={e => setFormData({ ...formData, inputDate: e.target.value })}
                                                />
                                            </div>

                                            {/* Tech details */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Priority</label>
                                                    <select
                                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#0f172a] transition-all outline-none font-semibold text-slate-700"
                                                        value={formData.priority}
                                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                                    >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                        <option value="Urgent">Urgent</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Source</label>
                                                    <select
                                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#0f172a] transition-all outline-none font-semibold text-slate-700"
                                                        value={formData.source}
                                                        onChange={e => setFormData({ ...formData, source: e.target.value })}
                                                    >
                                                        <option value="WhatsApp">WA</option>
                                                        <option value="Instagram">IG</option>
                                                        <option value="Facebook">FB</option>
                                                        <option value="Lainnya">Lainnya</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Deadline</label>
                                                <input
                                                    required type="datetime-local"
                                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#0f172a] transition-all outline-none font-semibold text-slate-700"
                                                    value={formData.deadline}
                                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                                />
                                            </div>

                                            {/* Description */}
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Penjelasan Detail</label>
                                                <textarea
                                                    required rows={4}
                                                    className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#0f172a] transition-all outline-none font-semibold text-slate-700 resize-none"
                                                    placeholder="Deskripsikan masalah selengkap mungkin..."
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>

                                            {/* Attachment Modern */}
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Lampiran Lampiran (JPG)</label>
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="group relative h-40 w-full rounded-[2.5rem] border-2 border-dashed border-slate-100 hover:border-[#0f172a] flex items-center justify-center cursor-pointer transition-all overflow-hidden bg-slate-50/50 hover:bg-blue-50/20"
                                                >
                                                    {formData.attachment ? (
                                                        <div className="absolute inset-0 flex items-center justify-center p-4">
                                                            <img src={formData.attachment} alt="Preview" className="h-full w-40 object-cover rounded-2xl shadow-xl border-4 border-white" />
                                                            <div className="ml-4">
                                                                <div className="text-xs font-semibold text-[#0f172a] uppercase tracking-widest mb-1">File Attached!</div>
                                                                <div className="text-[10px] text-slate-400 font-semibold uppercase">Click to change</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[#0f172a] transition-colors shadow-sm">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-[0.05em]">Upload capture komplain pelanggan</span>
                                                        </div>
                                                    )}
                                                    <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg" onChange={handleFileChange} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 flex items-center gap-6">
                                            <button
                                                type="button"
                                                onClick={() => setView("list")}
                                                className="px-10 py-5 rounded-2xl bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-10 py-5 rounded-2xl bg-gradient-to-r from-[#0f172a] to-[#312e81] text-white font-semibold text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(14,41,218,0.2)] hover:shadow-[0_25px_50px_rgba(14,41,218,0.3)] hover:scale-[1.01] active:scale-95 transition-all"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            /* BEAUTIFUL DETAIL VIEW */
                            <div className="max-w-4xl mx-auto animate-slide-up">
                                {selectedTicket ? (
                                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                                        <div className="bg-[#0f172a] p-8 md:p-12 text-white">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <select
                                                        className={`px-4 py-2 rounded-2xl text-[11px] font-semibold uppercase tracking-widest border-2 transition-all outline-none appearance-none cursor-pointer ${selectedTicket.status === "Done" ? "bg-green-500 border-green-400 text-white" :
                                                            selectedTicket.status === "In Progress" ? "bg-amber-500 border-amber-400 text-white" :
                                                                "bg-white/10 border-white/20 text-white"
                                                            }`}
                                                        value={selectedTicket.status}
                                                        onChange={(e) => updateTicketField(selectedTicket.id, "status", e.target.value)}
                                                    >
                                                        <option value="New" className="text-slate-900">New / Open</option>
                                                        <option value="In Progress" className="text-slate-900">In Progress</option>
                                                        <option value="Done" className="text-slate-900">Done (Selesai)</option>
                                                        <option value="Closed" className="text-slate-900">Closed (Selesai)</option>
                                                    </select>

                                                    <select
                                                        className="px-4 py-2 rounded-2xl text-[11px] font-semibold uppercase tracking-widest border-2 border-white/20 bg-white/10 text-white outline-none appearance-none cursor-pointer hover:bg-white/20 transition-all"
                                                        value={selectedTicket.priority}
                                                        onChange={(e) => updateTicketField(selectedTicket.id, "priority", e.target.value)}
                                                    >
                                                        <option value="Low" className="text-slate-900">Low Priority</option>
                                                        <option value="Medium" className="text-slate-900">Medium Priority</option>
                                                        <option value="High" className="text-slate-900">High Priority</option>
                                                        <option value="Urgent" className="text-slate-900">Urgent Priority</option>
                                                    </select>
                                                </div>
                                                <div className="text-xs font-semibold opacity-60 uppercase tracking-widest">ID: {selectedTicket.id}</div>
                                            </div>
                                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2 leading-tight">{selectedTicket.title}</h2>
                                            <div className="flex flex-wrap items-center gap-6 text-sm opacity-80 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    {selectedTicket.customerName}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {new Date(selectedTicket.inputDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 md:p-12 space-y-12">
                                            {/* Key Details Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Priority</div>
                                                    <div className="font-semibold text-slate-800">{selectedTicket.priority}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Source</div>
                                                    <div className="font-semibold text-slate-800">{selectedTicket.source}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Contact</div>
                                                    <div className="font-semibold text-slate-800 underline decoration-[#0f172a]/20">{selectedTicket.customerContact}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Deadline</div>
                                                    <div className="font-semibold text-red-500">{new Date(selectedTicket.deadline).toLocaleString('id-ID')}</div>
                                                </div>
                                            </div>

                                            {/* Description Area */}
                                            <div className="space-y-4">
                                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Penjelasan Detail</div>
                                                <div className="p-6 bg-slate-50 rounded-3xl text-slate-700 leading-relaxed font-medium">
                                                    {selectedTicket.description}
                                                </div>
                                            </div>


                                            {/* Attachment Display */}
                                            {selectedTicket.attachment && (
                                                <div className="space-y-4">
                                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Lampiran Gambar</div>
                                                    <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-xl">
                                                        <img src={selectedTicket.attachment} alt="Attachment" className="w-full h-auto object-cover" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-8 border-t border-slate-100 flex gap-4">
                                                <button
                                                    onClick={() => {
                                                        setView("list");
                                                        setSelectedTicket(null);
                                                    }}
                                                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                                                >
                                                    Back to List
                                                </button>
                                                <button
                                                    onClick={() => updateTicketField(selectedTicket.id, "status", "Done")}
                                                    className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    Mark as Done
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center text-slate-400 font-semibold italic">Pilih tiket untuk melihat detail.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* BEAUTIFUL SUCCESS POPUP */}
                    {showSuccess && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                            <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl shadow-indigo-900/20 border border-slate-100 flex flex-col items-center text-center animate-slide-up">
                                <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
                                    <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20" />
                                    <svg className="w-10 h-10 text-green-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-semibold text-slate-800 mb-2">Berhasil!</h3>
                                <p className="text-slate-500 font-medium leading-relaxed mb-8">Data tiket Anda telah disimpan dengan aman ke dalam sistem.</p>
                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="w-full py-4 bg-[#0f172a] text-white rounded-2xl font-semibold text-sm uppercase tracking-widest shadow-lg shadow-indigo-900/30 hover:scale-[1.02] transition-all"
                                >
                                    Oke, Mengerti
                                </button>
                            </div>
                        </div>
                    )}

                    <style jsx>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-up {
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
                </main>
            </div>

            {/* MOBILE MENU */}
            {menuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setMenuOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#081A8F]" />
                        <div className="relative z-10 h-full flex flex-col p-6 text-white">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl">
                                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                            <circle cx="12" cy="12" r="4" fill="currentColor" />
                                        </svg>
                                    </div>
                                    <div className="text-lg font-semibold">Menu</div>
                                </div>
                                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <nav className="space-y-2">
                                <NavItem href="/AdminOrbit/dashboard" icon="grid" label="Dashboard" />
                                <NavItem href="/AdminOrbit/tickets" active icon="ticket" label="Tickets" badge={tickets.length.toString()} />
                                <NavItem href="/AdminOrbit/laporan" icon="chart" label="Laporan" />
                                <div className="pt-10">
                                    <NavItem href="#" icon="logout" label="Logout" />
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TicketsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-14 w-14 border-4 border-slate-100 border-t-[#0f172a] rounded-full animate-spin shadow-inner" />
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.4em] animate-pulse">Initializing System</div>
                </div>
            </div>
        }>
            <TicketsContent />
        </Suspense>
    );
}
