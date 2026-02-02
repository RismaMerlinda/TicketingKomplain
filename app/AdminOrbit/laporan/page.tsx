"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Ticket {
    id: string;
    title: string;
    customerName: string;
    status: string;
    priority: string;
    inputDate: string;
    source: string;
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

function LaporanContent() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filterDateStart, setFilterDateStart] = useState("");
    const [filterDateEnd, setFilterDateEnd] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [viewMode, setViewMode] = useState<"board" | "table">("board");

    useEffect(() => {
        const stored = localStorage.getItem("orbit_tickets");
        if (stored) {
            setTickets(JSON.parse(stored));
        }
    }, []);

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const matchesStatus = filterStatus === "All" || t.status === filterStatus;

            const ticketDate = new Date(t.inputDate).getTime();
            const start = filterDateStart ? new Date(filterDateStart).getTime() : 0;
            const end = filterDateEnd ? new Date(filterDateEnd).getTime() : Infinity;

            const matchesRange = ticketDate >= start && ticketDate <= end;

            return matchesStatus && matchesRange;
        });
    }, [tickets, filterDateStart, filterDateEnd, filterStatus]);

    // Kanban Mapping
    const boardData = useMemo(() => {
        return {
            "No Status": filteredTickets.filter(t => t.status === "Open" && t.priority !== "Urgent" && t.priority !== "High"),
            "Next Up": filteredTickets.filter(t => t.status === "Open" && (t.priority === "Urgent" || t.priority === "High")),
            "In Progress": filteredTickets.filter(t => t.status === "In Progress"),
            "Completed": filteredTickets.filter(t => t.status === "Done" || t.status === "Closed")
        };
    }, [filteredTickets]);

    const handleDownloadCSV = () => {
        const headers = ["ID Ticket", "Judul", "Pelanggan", "Status", "Prioritas", "Tanggal", "Sumber"];

        // Proper CSV formatting with escaping
        const escapeCSV = (str: string) => `"${String(str).replace(/"/g, '""')}"`;

        const rows = filteredTickets.map(t => [
            escapeCSV(t.id),
            escapeCSV(t.title),
            escapeCSV(t.customerName),
            escapeCSV(t.status),
            escapeCSV(t.priority),
            escapeCSV(t.inputDate),
            escapeCSV(t.source)
        ]);

        const csvContent = "\uFEFF" + [ // Add BOM for Excel UTF-8 support
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Laporan_Orbit_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // --- HEADER DESIGN ---
        doc.setFillColor(15, 23, 42); // Navy Blue
        doc.rect(0, 0, 210, 40, 'F');

        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("ORBIT BILLIARD", 14, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("LAPORAN OPERASIONAL TICKETING", 14, 28);

        doc.setFontSize(8);
        const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        doc.text(`Dicetak pada: ${dateStr}`, 145, 20);
        doc.text(`Periode: ${filterDateStart || 'Awal'} s/d ${filterDateEnd || 'Sekarang'}`, 145, 25);
        doc.text(`Status: ${filterStatus}`, 145, 30);

        // --- TABLE ---
        const tableColumn = ["ID Ticket", "Judul Keluhan", "Pelanggan", "Status", "Prioritas", "Tanggal"];
        const tableRows = filteredTickets.map(t => [
            t.id,
            t.title,
            t.customerName,
            t.status.toUpperCase(),
            t.priority.toUpperCase(),
            new Date(t.inputDate).toLocaleDateString('id-ID')
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
                valign: 'middle'
            },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [15, 23, 42], halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'center' },
                5: { halign: 'center' }
            },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        // --- FOOTER SUMMARY ---
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.setDrawColor(229, 231, 235);
        doc.line(14, finalY, 196, finalY);

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.text("RINGKASAN DATA", 14, finalY + 10);

        doc.setFont("helvetica", "normal");
        doc.text(`Total Tiket Ditemukan: ${filteredTickets.length}`, 14, finalY + 18);
        doc.text(`Tiket Terselesaikan: ${filteredTickets.filter(t => t.status === "Done" || t.status === "Closed").length}`, 14, finalY + 24);
        doc.text(`Tiket Dalam Proses: ${filteredTickets.filter(t => t.status === "In Progress").length}`, 14, finalY + 30);

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("© 2024 Orbit Billiard Management System - Rahasia Internal", 14, 285);

        doc.save(`Orbit_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

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
                        <div className="text-sm font-semibold text-slate-800">Laporan</div>
                    </div>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-slate-50">
                        <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
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
                            <NavItem href="/AdminOrbit/tickets" icon="ticket" label="Tickets" badge={tickets.length.toString()} />
                            <NavItem href="/AdminOrbit/laporan" active icon="chart" label="Laporan" />
                        </nav>
                        <div className="pt-6 border-t border-white/5">
                            <NavItem href="#" icon="logout" label="Logout" />
                        </div>
                    </div>
                </aside>

                <main className="flex-1 min-w-0 p-4 md:p-6">
                    {/* Header */}
                    <div className="bg-white border border-slate-100 rounded-2xl px-6 py-6 md:px-8 md:py-8 sticky top-0 z-30 shadow-sm">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
                                    Laporan <span className="text-[#0f172a]">Tiket</span>
                                </h1>
                                <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wide no-print">Gunakan filter untuk memilah data laporan spesifik.</p>
                            </div>
                            <div className="flex flex-wrap gap-3 no-print">
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all text-xs"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Cetak
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-[#0f172a] rounded-xl font-semibold shadow-sm hover:bg-blue-50 transition-all text-xs"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    PDF
                                </button>
                                <button
                                    onClick={handleDownloadCSV}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0f172a] text-white rounded-xl font-semibold shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/30 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto p-4 md:p-6">
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm items-end animate-slide-up no-print">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Dari Tanggal</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-[#0f172a] outline-none font-semibold text-sm text-slate-700"
                                    value={filterDateStart}
                                    onChange={(e) => setFilterDateStart(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Sampai Tanggal</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-[#0f172a] outline-none font-semibold text-sm text-slate-700"
                                    value={filterDateEnd}
                                    onChange={(e) => setFilterDateEnd(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Status Tiket</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-[#0f172a] outline-none font-semibold text-sm text-slate-700"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="All">Semua Status</option>
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                            <button
                                onClick={() => {
                                    setFilterDateStart("");
                                    setFilterDateEnd("");
                                    setFilterStatus("All");
                                }}
                                className="w-full px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Reset Filter
                            </button>
                        </div>

                        {/* KANBAN BOARD HEADER */}
                        <div className="mb-8 no-print">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                </div>
                                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Daftar Tiket & Keluhan</h2>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mb-8">Pilih mode tampilan untuk memantau perkembangan tiket operasional.</p>

                            <div className="flex items-center gap-8 border-b border-slate-100 overflow-x-auto no-scrollbar">
                                {[
                                    { id: "board", label: "Board View" },
                                    { id: "table", label: "List View" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setViewMode(tab.id as any)}
                                        className={`flex items-center gap-2 pb-4 text-xs font-semibold transition-all relative ${viewMode === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                                    >
                                        {viewMode === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
                                        <span className="uppercase tracking-[0.1em]">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {viewMode === "board" ? (
                            /* CLEAN KANBAN BOARD */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-slide-up no-print">
                                {(Object.entries(boardData) as [string, Ticket[]][]).map(([column, columnTickets]) => (
                                    <div key={column} className="flex flex-col gap-6">
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                                {column}
                                            </span>
                                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{columnTickets.length}</span>
                                        </div>

                                        <div className="flex flex-col gap-4 min-h-[500px]">
                                            {columnTickets.map((t) => (
                                                <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 transition-all group cursor-pointer">
                                                    <div className="flex gap-4 mb-4">
                                                        <h3 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-slate-600 transition-colors">{t.title}</h3>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {t.priority === "Urgent" && (
                                                            <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-semibold rounded uppercase tracking-wider">
                                                                Urgent
                                                            </span>
                                                        )}
                                                        <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 text-[9px] font-semibold rounded uppercase tracking-wider">
                                                            {t.source}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-400 uppercase">
                                                                {t.customerName.charAt(0)}
                                                            </div>
                                                            <span className="text-[10px] font-semibold text-slate-600">{t.customerName}</span>
                                                        </div>
                                                        <div className="text-[9px] font-medium text-slate-400">
                                                            #{t.id.slice(-4)}
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/AdminOrbit/tickets?action=detail&id=${t.id}`}
                                                        className="mt-4 block w-full py-2 text-center bg-slate-50 hover:bg-slate-100 text-[#0f172a] text-[9px] font-semibold uppercase tracking-[0.2em] rounded-xl transition-all"
                                                    >
                                                        View Detail
                                                    </Link>
                                                </div>
                                            ))}
                                            {columnTickets.length === 0 && (
                                                <div className="flex-1 rounded-2xl border border-dashed border-slate-100 flex items-center justify-center p-8 opacity-40">
                                                    <span className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest">No Items</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* CLEAN TABLE */
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-8 py-4 text-left text-[9px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Description</th>
                                                <th className="px-6 py-4 text-left text-[9px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Priority</th>
                                                <th className="px-6 py-4 text-right text-[9px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredTickets.map((t) => (
                                                <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="text-sm font-semibold text-slate-800">{t.title}</div>
                                                        <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter">{t.id}</div>
                                                    </td>
                                                    <td className="px-6 py-5 text-xs font-semibold text-slate-600">{t.customerName}</td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="text-[10px] font-semibold uppercase text-slate-600">{t.status}</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className={`text-[10px] font-semibold uppercase ${t.priority === "Urgent" ? "text-slate-900 underline decoration-2 underline-offset-4" : "text-slate-400"}`}>
                                                            {t.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                                                        {new Date(t.inputDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <Link
                                                            href={`/AdminOrbit/tickets?action=detail&id=${t.id}`}
                                                            className="px-4 py-1.5 bg-[#0f172a] text-white text-[9px] font-semibold uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all inline-block"
                                                        >
                                                            Detail
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Summary Footer */}
                        <div className="mt-8 flex justify-end">
                            <div className="bg-slate-900 px-8 py-4 rounded-3xl text-white flex items-center gap-8 shadow-2xl">
                                <div className="text-center">
                                    <div className="text-[9px] font-semibold opacity-40 uppercase">Total Tiket</div>
                                    <div className="text-xl font-semibold">{filteredTickets.length}</div>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <div className="text-[9px] font-semibold text-green-400 uppercase">Selesai</div>
                                    <div className="text-xl font-semibold">{filteredTickets.filter(t => t.status === "Done" || t.status === "Closed").length}</div>
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
                                <NavItem href="/AdminOrbit/dashboard" icon="grid" label="Dashboard" />
                                <NavItem href="/AdminOrbit/tickets" icon="ticket" label="Tickets" badge={tickets.length.toString()} />
                                <NavItem href="/AdminOrbit/laporan" active icon="chart" label="Laporan" />
                                <div className="pt-10">
                                    <NavItem href="#" icon="logout" label="Logout" />
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        padding: 0 !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .animate-slide-up {
                        animation: none !important;
                        opacity: 1 !important;
                        transform: none !important;
                    }
                    table {
                        border: 1px solid #e2e8f0 !important;
                        page-break-inside: auto;
                    }
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    aside {
                        display: none !important;
                    }
                    .max-w-7xl {
                        max-width: 100% !important;
                        padding: 0 !important;
                    }
                    header {
                        position: static !important;
                        border-bottom: 2px solid #0f172a !important;
                        margin-bottom: 20px !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default function LaporanPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat Laporan...</div>}>
            <LaporanContent />
        </Suspense>
    );
}
