"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";

// --- TYPES & INTERFACES ---
interface Ticket {
    id: string;
    title: string;
    customerName: string;
    status: string;
    priority: string;
    deadline: string;
    inputDate: string;
    createdAt: string;
}

interface NavItemProps {
    icon: string;
    label: string;
    active?: boolean;
    badge?: string;
    href?: string;
}

// --- COMPONENTS ---

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

function StatCard({ label, value, color, icon, detail, delay, onClick, textColor = "text-slate-900" }: any) {
    const getIcon = () => {
        switch (icon) {
            case "in-progress": return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case "overdue": return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
            case "total": return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
            case "new": return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6" /></svg>;
            default: return null;
        }
    };

    const getDetailStyle = () => {
        if (detail === "Critical") return "bg-indigo-50 text-[#0f172a] shadow-[0_0_10px_rgba(15,23,42,0.1)]";
        if (detail === "Action Needed") return "bg-indigo-50 text-[#0f172a]";
        if (detail === "Monitoring") return "bg-indigo-50 text-[#0f172a]";
        return "bg-slate-50 text-[#0f172a]";
    };

    return (
        <div onClick={onClick} className="group relative bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-100 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-indigo-900/10 cursor-pointer overflow-hidden transform hover:-translate-y-1 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
            <div className="flex justify-between items-start relative z-10">
                <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0f172a] group-hover:text-white transition-all duration-500">{getIcon()}</div>
                {detail && <div className={`px-2 py-1 rounded-md text-[8px] font-semibold uppercase tracking-widest ${getDetailStyle()}`}>{detail}</div>}
            </div>
            <div className="mt-5 relative z-10">
                <div className="text-[9px] font-semibold text-[#0f172a] uppercase tracking-[0.2em]">{label}</div>
                <div className={`text-2xl font-bold text-[#0f172a] mt-1 tracking-tight`}>{value}</div>
            </div>
        </div>
    );
}

function ChartCard({ title, children, delay }: any) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm hover:shadow-lg transition-all duration-500 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold text-[#1A1F2B] tracking-tight">{title}</h3></div>
            {children}
        </div>
    );
}

// --- MAIN PAGE ---

export default function Dashboard() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("orbit_tickets");
        if (stored) {
            setTickets(JSON.parse(stored));
        }
    }, []);

    const newTicketsCount = tickets.filter(t => t.status === "Open" || t.status === "New").length;
    const inProgressCount = tickets.filter(t => t.status === "In Progress").length;
    const overdueCount = tickets.filter(t => {
        if (!t.deadline || t.status === "Done" || t.status === "Closed") return false;
        return new Date(t.deadline).getTime() < new Date().getTime();
    }).length;

    const nearDeadlineTickets = React.useMemo(() => {
        return tickets.filter(t => {
            // Kita sembunyikan tiket yang sudah Done atau Closed
            if (t.status === "Done" || t.status === "Closed") return false;

            // Jika tidak ada deadline, tidak masuk hitungan
            if (!t.deadline) return false;

            const deadlineDate = new Date(t.deadline).getTime();
            const now = new Date().getTime();
            const diff = deadlineDate - now;

            // Tampilkan tiket yang:
            // 1. Sudah lewat deadline (Overdue) -> diff <= 0
            // 2. Deadline dalam 14 hari ke depan -> diff <= 14 hari
            const fourteenDays = 14 * 24 * 60 * 60 * 1000;
            return diff <= fourteenDays;
        }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 5);
    }, [tickets]);

    const chartData = React.useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        const today = new Date();
        const result = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthIdx = d.getMonth();
            const yearIdx = d.getFullYear();

            const count = tickets.filter(t => {
                const tDate = new Date(t.inputDate);
                return tDate.getMonth() === monthIdx && tDate.getFullYear() === yearIdx;
            }).length;

            result.push({ label: monthNames[monthIdx], count });
        }
        return result;
    }, [tickets]);

    const maxChartValue = Math.max(...chartData.map(d => d.count), 5);

    const recentActivity = [
        { who: "Admin Orbit", action: "memperbarui status", code: "TKT-001", when: "2 menit yang lalu" },
        { who: "System", action: "tiket baru masuk", code: "TKT-003", when: "15 menit yang lalu" },
        { who: "Admin Orbit", action: "menyelesaikan tiket", code: "TKT-005", when: "1 jam yang lalu" },
        { who: "System", action: "deadline terlewati", code: "TKT-002", when: "3 jam yang lalu" },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <style jsx global>{`
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
                body { color: #1A1F2B; font-family: var(--font-poppins), sans-serif; }
            `}</style>

            {/* MOBILE HEADER */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] md:hidden">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>
                        </div>
                        <div className="text-sm font-semibold uppercase">Orbit Admin</div>
                    </div>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-[#F2F3F5]"><svg className="w-6 h-6 text-[#1A1F2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
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
                            <NavItem href="/AdminOrbit/dashboard" active icon="grid" label="Dashboard" />
                            <NavItem href="/AdminOrbit/tickets" icon="ticket" label="Tickets" badge={tickets.length.toString()} />
                            <NavItem href="/AdminOrbit/laporan" icon="chart" label="Laporan" />
                        </nav>
                        <div className="pt-6 border-t border-white/5">
                            <NavItem href="#" icon="logout" label="Logout" />
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
                            <div>
                                <h2 className="text-[9px] font-semibold text-[#0f172a] uppercase tracking-[0.4em] mb-2 pl-1">Overview Dashboard</h2>
                                <h1 className="text-2xl font-semibold text-[#0f172a] tracking-tight leading-none">Kinerja <span className="text-[#0f172a]">Operasional</span></h1>
                                <p className="text-[#0f172a] mt-2 text-xs font-medium">Monitoring performa ticketing dan operasional Orbit Billiard.</p>
                            </div>
                            <Link
                                href="/AdminOrbit/tickets?action=new"
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0f172a] text-white rounded-xl font-semibold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-slate-200 hover:shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                                Buat Tiket Baru
                            </Link>
                        </header>

                        {/* STATS GRID */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard label="Total Tiket" value={tickets.length} color="from-slate-100 to-slate-50" textColor="text-slate-900" icon="total" detail="All Time" delay={100} onClick={() => window.location.href = '/AdminOrbit/tickets'} />
                            <StatCard label="Tiket Baru" value={newTicketsCount} color="from-slate-100 to-slate-50" textColor="text-slate-900" icon="new" detail="Action Needed" delay={200} onClick={() => window.location.href = '/AdminOrbit/tickets?filter=New'} />
                            <StatCard label="Dalam Proses" value={inProgressCount} color="from-slate-100 to-slate-50" textColor="text-slate-900" icon="in-progress" detail="Monitoring" delay={300} onClick={() => window.location.href = '/AdminOrbit/tickets?filter=InProgress'} />
                            <StatCard label="Tertunda" value={overdueCount} color="from-slate-100 to-slate-50" textColor="text-slate-900" icon="overdue" detail="Critical" delay={400} onClick={() => window.location.href = '/AdminOrbit/tickets?filter=Overdue'} />
                        </div>

                        {/* DEADLINE ALERT COMPACT */}
                        {overdueCount > 0 && (
                            <div className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
                                <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg animate-pulse"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-semibold text-red-900 tracking-tight">Perhatian: {overdueCount} Tiket Melebihi Deadline!</h3>
                                    <p className="text-red-600 text-[10px] font-semibold mt-1 uppercase tracking-wide">Segera tindak lanjuti untuk menjaga kepuasan customer.</p>
                                </div>
                                <button onClick={() => window.location.href = '/AdminOrbit/tickets?filter=Overdue'} className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Selesaikan Tiket →</button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            <div className="lg:col-span-2 space-y-6">
                                <ChartCard title="Grafik Komplain per Bulan" delay={600}>
                                    <div className="h-[240px] w-full flex items-end justify-between px-2 pb-2">
                                        {chartData.map((data, i) => (
                                            <div key={i} className="group relative flex flex-col items-center w-full">
                                                <div className="absolute -top-10 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">{data.count} Tiket</div>
                                                <div
                                                    className="w-8 bg-gradient-to-t from-[#0f172a] to-[#312e81] rounded-t-lg transition-all duration-700 ease-out group-hover:from-[#312e81] group-hover:to-[#0f172a]"
                                                    style={{ height: `${(data.count / maxChartValue) * 100}%`, minHeight: data.count > 0 ? '10px' : '2px' }}
                                                />
                                                <span className="text-[9px] font-semibold text-[#0f172a] mt-3 uppercase tracking-wider">{data.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ChartCard>

                                <div className="animate-slide-up" style={{ animationDelay: '700ms' }}>
                                    <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500 opacity-[0.02] rounded-bl-[4rem]" />

                                        <div className="flex items-center justify-between mb-6 relative z-10">
                                            <div>
                                                <h4 className="text-base font-semibold text-[#0f172a] tracking-tight flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                                    Mendekati Deadline
                                                </h4>
                                                <p className="text-[10px] text-[#0f172a] font-semibold mt-0.5 uppercase tracking-widest leading-none">Selesaikan sebelum terlambat</p>
                                            </div>
                                            <Link href="/AdminOrbit/tickets" className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 text-[9px] font-semibold uppercase tracking-widest rounded-lg transition-all border border-slate-100">
                                                Detail Tiket →
                                            </Link>
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                            {nearDeadlineTickets.length === 0 ? (
                                                <div className="py-6 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                    <p className="text-xs text-slate-400 font-semibold italic">Tidak ada tiket mendekati deadline. ✨</p>
                                                </div>
                                            ) : (
                                                nearDeadlineTickets.map((t) => (
                                                    <div key={t.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-orange-200 transition-all group/item">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-semibold shadow-md ${t.priority === "Urgent" ? "bg-red-500 shadow-red-200" :
                                                                t.priority === "High" ? "bg-orange-500 shadow-orange-200" : "bg-blue-500 shadow-blue-200"
                                                                }`}>
                                                                {t.id.slice(-2)}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-semibold text-[#0f172a] transition-colors group-hover/item:text-orange-600">{t.title}</div>
                                                                <div className="text-[9px] font-semibold text-[#0f172a] mt-0.5 uppercase tracking-wider">{t.customerName} • {t.priority}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[8px] font-semibold text-[#0f172a]/50 uppercase tracking-widest leading-none">Target</div>
                                                            <div className="text-[10px] font-semibold text-orange-600 px-1.5 py-0.5 bg-orange-50 rounded mt-1 inline-block">
                                                                {new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ChartCard title="Aktivitas Terbaru" delay={800}>
                                <div className="space-y-3">
                                    {recentActivity.map((a, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100/50">
                                            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-semibold leading-none shrink-0">{a.who.split(' ').map(n => n[0]).join('')}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] text-[#0f172a] leading-tight">
                                                    <span className="font-semibold">{a.who}</span> {a.action} <span className="font-semibold text-indigo-600">{a.code}</span>
                                                </div>
                                                <div className="text-[9px] text-[#0f172a] font-semibold uppercase tracking-tighter mt-0.5">{a.when}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-6 py-2 bg-slate-50 text-slate-400 text-[9px] font-semibold rounded-lg border border-slate-100 hover:bg-slate-100 transition-all uppercase tracking-widest">LIHAT SEMUA LOG AKTIVITAS</button>
                            </ChartCard>
                        </div>

                        <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 p-4 animate-slide-up" style={{ animationDelay: '900ms' }}>
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <div className="text-[11px] text-[#0f172a] font-semibold uppercase tracking-wide">
                                    <span className="text-indigo-600">Note:</span> Dashboard khusus Admin Produk Orbit Billiard.
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* MOBILE MENU PRETTIER GRADIENT */}
            {menuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-64 overflow-hidden shadow-2xl bg-gradient-to-b from-[#0f172a] to-[#1e1b4b]">
                        <div className="relative z-10 h-full flex flex-col p-6">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] flex items-center justify-center shadow-lg">
                                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
                                            <circle cx="12" cy="12" r="4" fill="currentColor" />
                                        </svg>
                                    </div>
                                    <div className="text-white font-semibold tracking-tight text-xs uppercase">Orbit Admin</div>
                                </div>
                                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <nav className="space-y-1.5">
                                <NavItem href="/AdminOrbit/dashboard" active icon="grid" label="Dashboard" />
                                <NavItem href="/AdminOrbit/tickets" icon="ticket" label="Tickets" badge={tickets.length.toString()} />
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
