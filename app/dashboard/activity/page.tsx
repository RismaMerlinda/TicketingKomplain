"use client";

import Header from "@/app/components/Header";
import { useAuth } from "../../context/AuthContext";
import { Activity, User, Clock, Package, Calendar, Filter, X, ChevronUp, ChevronDown, ChevronRight, Info, ShieldCheck, Mail, Globe, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ROLES } from "@/lib/auth";
import { getStoredLogs, formatRelativeTime } from "@/lib/activity";
import { useState, useEffect } from "react";

export default function ActivityPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [dateFilter, setDateFilter] = useState("");
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Helper: Get date string in local WIB time (UTC+7)
    const getLocalDateString = (ts: number | string | Date) => {
        const d = new Date(ts);
        // Offset for WIB (UTC+7)
        const offsetDate = new Date(d.getTime() + (7 * 60 * 60 * 1000));
        return offsetDate.toISOString().split('T')[0];
    };

    const adjustDate = (days: number) => {
        const current = dateFilter ? new Date(dateFilter) : new Date();
        current.setDate(current.getDate() + days);
        setDateFilter(current.toISOString().split('T')[0]);
    };

    // Update real-time relative strings every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(timer);
    }, []);

    const refreshLogs = () => {
        const allLogs = getStoredLogs();
        const filtered = allLogs.filter(log => {
            // Role/Product Scope
            if (user?.role === ROLES.PRODUCT_ADMIN && user?.productId) {
                if (log.product !== user.productId) return false;
            }

            // Date Filter Logic: Compare using local date strings
            if (dateFilter) {
                const logDate = getLocalDateString(log.timestamp);
                if (logDate !== dateFilter) return false;
            }

            return true;
        });
        setLogs(filtered);
    };

    useEffect(() => {
        refreshLogs();
        window.addEventListener('activityUpdated', refreshLogs);
        return () => window.removeEventListener('activityUpdated', refreshLogs);
    }, [user, dateFilter]);

    const getActivityStyles = (text: string) => {
        const t = text.toLowerCase();
        if (t.includes('pending')) return { iconBg: 'bg-gray-500/10', iconColor: 'text-gray-500' };
        if (t.includes('closed')) return { iconBg: 'bg-slate-950/10', iconColor: 'text-slate-950' };
        if (t.includes('done') || t.includes('resolved') || t.includes('completed')) return { iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' };
        if (t.includes('created') || t.includes('new')) return { iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600' };
        if (t.includes('progress') || t.includes('in progress')) return { iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600' };
        if (t.includes('updated') || t.includes('changed') || t.includes('modify')) return { iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-600' };
        if (t.includes('deleted') || t.includes('removed')) return { iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' };
        return { iconBg: 'bg-slate-50', iconColor: 'text-slate-400' };
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Header title="Activity Logs" subtitle="Tracking every action in the system" />

            <div className="max-w-[1200px] mx-auto px-8 py-8 space-y-6">

                {/* Visual Filters Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1500FF]/5 flex items-center justify-center text-[#1500FF]">
                            <Filter size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">Filter Activities</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Narrow down logs by specific date</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1500FF] transition-colors" size={18} />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full pl-12 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1500FF]/10 focus:border-[#1500FF] text-sm font-bold text-slate-700 transition-all cursor-pointer"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                                <button onClick={() => adjustDate(1)} className="p-0.5 hover:bg-white rounded shadow-sm text-slate-600 transition-colors"><ChevronUp size={12} /></button>
                                <button onClick={() => adjustDate(-1)} className="p-0.5 hover:bg-white rounded shadow-sm text-slate-600 transition-colors"><ChevronDown size={12} /></button>
                            </div>
                        </div>
                        {dateFilter && (
                            <button
                                onClick={() => setDateFilter("")}
                                className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                                title="Clear Filter"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="font-extrabold text-[#0A1332] text-sm uppercase tracking-widest flex items-center gap-2">
                                <Activity size={18} className="text-[#1500FF]" />
                                Live System Activities
                            </h3>
                            {dateFilter && (
                                <span className="text-[10px] font-bold bg-[#1500FF] text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                    Date: {dateFilter}
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                            {logs.length} logs found
                        </span>
                    </div>

                    <div className="divide-y divide-slate-50">
                        <AnimatePresence mode="popLayout">
                            {logs.map((log) => {
                                const styles = getActivityStyles(log.text);
                                return (
                                    <div key={log.id} className="border-b border-slate-50 last:border-0">
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className={`p-6 hover:bg-slate-50 transition-all flex items-start gap-4 group cursor-pointer ${expandedId === log.id ? 'bg-slate-50/80 shadow-inner' : ''}`}
                                            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                                        >
                                            <div className={`w-10 h-10 rounded-2xl ${styles.iconBg} border border-transparent flex items-center justify-center ${styles.iconColor} transition-all group-hover:scale-110`}>
                                                <Clock size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-800 group-hover:text-[#1500FF] transition-colors">{log.text}</p>
                                                        {log.details && <span className="w-1.5 h-1.5 rounded-full bg-[#1500FF] animate-pulse" />}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                            {formatRelativeTime(log.timestamp)}
                                                        </span>
                                                        <ChevronRight size={16} className={`text-slate-300 transition-transform duration-300 ${expandedId === log.id ? 'rotate-90 text-[#1500FF]' : ''}`} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                        <User size={14} className="text-slate-300" />
                                                        {log.user}
                                                    </span>
                                                    {log.product && (
                                                        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                                                            <Package size={14} className="text-slate-300" />
                                                            <span className="uppercase">{log.product}</span>
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-slate-300 font-bold ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <AnimatePresence>
                                            {expandedId === log.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden bg-white/50"
                                                >
                                                    <div className="px-20 pb-8 pt-2 space-y-6">
                                                        {/* Time Detail Section */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
                                                                <div className="flex items-center gap-2 text-slate-400">
                                                                    <Calendar size={14} />
                                                                    <p className="text-[10px] font-black uppercase tracking-widest">Exact Date</p>
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-700">
                                                                    {new Date(log.timestamp).toLocaleDateString('id-ID', {
                                                                        weekday: 'long',
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
                                                                <div className="flex items-center gap-2 text-slate-400">
                                                                    <Clock size={14} />
                                                                    <p className="text-[10px] font-black uppercase tracking-widest">Exact Time</p>
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-700">
                                                                    {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        second: '2-digit',
                                                                        hour12: false
                                                                    })} WIB
                                                                </p>
                                                            </div>
                                                            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
                                                                <div className="flex items-center gap-2 text-slate-400">
                                                                    <ShieldCheck size={14} />
                                                                    <p className="text-[10px] font-black uppercase tracking-widest">Action Type</p>
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                                                                    {log.type || 'Standard Activity'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Description/Context Section */}
                                                        <div className="p-6 bg-[#1500FF]/5 rounded-3xl border border-[#1500FF]/10 space-y-3">
                                                            <div className="flex items-center gap-2 text-[#1500FF]">
                                                                <Info size={16} />
                                                                <h5 className="text-[11px] font-black uppercase tracking-widest">Detail Description</h5>
                                                            </div>
                                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                                {log.details || `Sistem mencatat aktivitas "${log.text}" oleh ${log.user} untuk ${log.product || 'sistem'}.`}
                                                            </p>
                                                        </div>

                                                        {/* System Metadata Tags */}
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 uppercase tracking-tighter">Event ID: {log.id}</span>
                                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 uppercase tracking-tighter">Priority: Medium</span>
                                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 uppercase tracking-tighter">Source: Web UI</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {logs.length === 0 && (
                        <div className="p-32 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Calendar size={32} className="text-slate-200" />
                            </div>
                            <h3 className="text-slate-700 font-bold">No logs for this date</h3>
                            <p className="text-slate-400 text-sm max-w-[250px] mx-auto mt-1">Try selecting another date or clear the filter to see all activities.</p>
                            {dateFilter && (
                                <button
                                    onClick={() => setDateFilter("")}
                                    className="mt-6 text-[#1500FF] text-sm font-bold hover:underline"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
