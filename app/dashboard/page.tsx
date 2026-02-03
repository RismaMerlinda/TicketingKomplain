"use client";

import Header from "@/app/components/Header";
import {
    Ticket,
    CheckCircle2,
    Clock,
    Inbox,
    TrendingUp,
    Users,
    Package,
    ArrowRight,
    Download,
    Plus,
    Filter,
    Activity,
    MoreHorizontal,
    Star
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Mock Data
const ticketTrendData = [
    { name: 'Mon', tickets: 24, resolved: 18 },
    { name: 'Tue', tickets: 38, resolved: 28 },
    { name: 'Wed', tickets: 30, resolved: 25 },
    { name: 'Thu', tickets: 45, resolved: 40 },
    { name: 'Fri', tickets: 55, resolved: 48 },
    { name: 'Sat', tickets: 20, resolved: 15 },
    { name: 'Sun', tickets: 15, resolved: 12 },
];

const statusDistData = [
    { name: 'Resolved', value: 2312, color: '#10B981' },
    { name: 'In Progress', value: 128, color: '#F59E0B' },
    { name: 'Pending', value: 32, color: '#64748B' },
    { name: 'Critical', value: 12, color: '#F43F5E' },
];

// Types
interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
};

// Components

function StatsCard({ title, value, icon, trend, trendUp }: StatsCardProps) {
    return (
        <motion.div variants={itemVariants as any} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
            {/* Subtle background shine */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-white group-hover:bg-[#1500FF] transition-all duration-300 shadow-sm border border-slate-100 group-hover:border-transparent group-hover:shadow-[#1500FF]/30">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border ${trendUp ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100"}`}>
                        {trendUp ? <TrendingUp size={12} className="mr-1.5" /> : <TrendingUp size={12} className="mr-1.5 rotate-180" />}
                        {trend}
                    </div>
                )}
            </div>
            <div className="relative z-10">
                <h3 className="text-4xl font-extrabold tracking-tighter bg-gradient-to-br from-slate-800 to-slate-500 bg-clip-text text-transparent group-hover:from-[#1500FF] group-hover:to-[#6366f1] transition-all duration-300">
                    {value}
                </h3>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mt-2">{title}</p>
            </div>
        </motion.div>
    );
}

function ProductStatCard({ name, total, active }: { name: string, total: number, active: number }) {
    return (
        <motion.div variants={itemVariants as any} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#1500FF]/20 transition-all duration-300 group hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-[#1500FF] group-hover:text-white transition-all duration-300 shadow-sm">
                        <Package size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-base text-slate-800 group-hover:text-[#1500FF] transition-colors">{name}</h4>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Software Product</p>
                    </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6 my-6">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Total Tickets</p>
                    <p className="text-2xl font-extrabold text-slate-700 bg-gradient-to-br from-slate-700 to-slate-500 bg-clip-text text-transparent">{total}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Active Issues</p>
                    <p className="text-2xl font-extrabold text-[#1500FF] bg-gradient-to-br from-[#1500FF] to-[#6366f1] bg-clip-text text-transparent">{active}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
                <button className="w-full text-xs font-bold text-slate-500 hover:text-[#1500FF] flex items-center justify-between transition-colors group-hover:px-2">
                    View Dashboard <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 group-hover:text-[#1500FF]" />
                </button>
            </div>
        </motion.div>
    );
}

export default function SuperAdminDashboard() {
    const [greeting, setGreeting] = useState("Welcome back");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    return (
        <div className="min-h-screen pb-12 bg-[#F8FAFC]">
            <Header title="Overview" subtitle="Metrics & Analytics" />

            <motion.main
                variants={containerVariants as any}
                initial="hidden"
                animate="show"
                className="max-w-[1600px] mx-auto px-8 py-8 space-y-10"
            >

                {/* 1. Key Metrics */}
                <section>
                    <motion.div variants={itemVariants as any} className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{greeting}, Super Admin</h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">Here's what's happening in your system today.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 hover:border-[#1500FF]/30 hover:text-[#1500FF] transition-all">
                                <Filter size={14} /> Last 30 Days
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <StatsCard title="Total Tickets" value="2,543" icon={<Ticket size={24} />} trend="+12%" trendUp={true} />
                        <StatsCard title="Pending" value="32" icon={<Inbox size={24} />} />
                        <StatsCard title="In Progress" value="128" icon={<Clock size={24} />} />
                        <StatsCard title="Resolved" value="2,312" icon={<CheckCircle2 size={24} />} trend="+8%" trendUp={true} />
                        <StatsCard title="Satisfaction Score" value="4.9/5.0" icon={<Star size={24} />} trend="+0.2" trendUp={true} />
                    </div>
                </section>

                {/* 2. Charts Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ticket Volume (Area Chart) */}
                    <motion.div variants={itemVariants as any} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Weekly Ticket Volume</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Incoming requests vs resolved</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <span className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100"><span className="w-2 h-2 rounded-full bg-[#1500FF] shadow-[0_0_8px_#1500FF]"></span>Tickets</span>
                                <span className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100"><span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>Resolved</span>
                            </div>
                        </div>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ticketTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1500FF" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#1500FF" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                                        labelStyle={{ fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 600, padding: 0 }}
                                    />
                                    <Area type="monotone" dataKey="tickets" stroke="#1500FF" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" activeDot={{ r: 6, strokeWidth: 0, fill: '#1500FF' }} />
                                    <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Status Distribution (Pie Chart) */}
                    <motion.div variants={itemVariants as any} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col hover:shadow-md transition-shadow">
                        <div className="mb-8">
                            <h3 className="font-bold text-slate-800 text-lg">Status Distribution</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Current breakdown</p>
                        </div>
                        <div className="flex-1 min-h-[220px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        cornerRadius={8}
                                        stroke="none"
                                    >
                                        {statusDistData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }} itemStyle={{ color: '#334155', fontWeight: 600 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <span className="block text-4xl font-black text-slate-800 tracking-tighter">2.5k</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Total</span>
                            </div>
                        </div>
                        <div className="mt-6 space-y-4">
                            {statusDistData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-sm group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] transition-all group-hover:scale-125" style={{ backgroundColor: item.color }} />
                                        <span className="text-slate-500 font-bold group-hover:text-slate-700 transition-colors">{item.name}</span>
                                    </div>
                                    <span className="font-extrabold text-slate-700">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 3. Product Overview (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.h2 variants={itemVariants as any} className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                            Product Health
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProductStatCard name="Catatmark" total={850} active={42} />
                            <ProductStatCard name="Joki Informatika" total={1240} active={85} />
                            <ProductStatCard name="Orbit Billiard" total={453} active={24} />

                            <motion.div variants={itemVariants as any} className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-[#1500FF]/40 hover:text-[#1500FF] hover:bg-[#1500FF]/5 transition-all cursor-pointer min-h-[200px] group">
                                <div className="p-4 bg-slate-50 rounded-full mb-3 group-hover:bg-white transition-colors group-hover:shadow-md group-hover:shadow-[#1500FF]/20">
                                    <Plus size={28} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-xs font-extrabold uppercase tracking-wider">Add New Product</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* 4. Action Center & Activity (Sidebar) */}
                    <div className="space-y-8">

                        {/* Quick Data */}
                        <motion.section variants={itemVariants as any} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
                            <h3 className="font-extrabold text-slate-800 mb-6 text-xs uppercase tracking-widest">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-[#1500FF] border border-transparent hover:shadow-lg hover:shadow-[#1500FF]/25 rounded-xl transition-all group duration-300">
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-white">Create New Ticket</span>
                                    <Plus size={18} className="text-slate-400 group-hover:text-white" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-[#1500FF] border border-transparent hover:shadow-lg hover:shadow-[#1500FF]/25 rounded-xl transition-all group duration-300">
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-white">Generate Report</span>
                                    <Download size={18} className="text-slate-400 group-hover:text-white" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-[#1500FF] border border-transparent hover:shadow-lg hover:shadow-[#1500FF]/25 rounded-xl transition-all group duration-300">
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-white">Manage Admins</span>
                                    <Users size={18} className="text-slate-400 group-hover:text-white" />
                                </button>
                            </div>
                        </motion.section>

                        {/* Minimal Activity Feed */}
                        <motion.section variants={itemVariants as any} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest">Live Activity</h3>
                                <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                    <span className="text-[10px] font-black text-emerald-700 uppercase">Live</span>
                                </div>
                            </div>
                            <div className="relative border-l border-slate-100 ml-2 space-y-8 pb-2">
                                {[
                                    { text: "Ticket #2942 resolved", time: "2 min ago", user: "Admin Joki" },
                                    { text: "New report generated", time: "15 min ago", user: "System" },
                                    { text: "User added to Orbit", time: "1 hr ago", user: "Super Admin" }
                                ].map((item, i) => (
                                    <div key={i} className="pl-8 relative group cursor-pointer hover:-translate-x-[-4px] transition-transform duration-200">
                                        <div className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full border-2 border-white bg-slate-300 group-hover:bg-[#1500FF] transition-colors ring-1 ring-slate-100 group-hover:ring-[#1500FF]/30 shadow-sm" />
                                        <p className="text-sm text-slate-600 font-bold group-hover:text-slate-900 transition-colors leading-relaxed">{item.text}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[11px] text-slate-400 font-semibold">{item.time}</span>
                                            <span className="w-0.5 h-3 bg-slate-200" />
                                            <span className="text-[11px] text-slate-400 font-semibold">{item.user}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    </div>
                </div>

            </motion.main>
        </div>
    );
}
