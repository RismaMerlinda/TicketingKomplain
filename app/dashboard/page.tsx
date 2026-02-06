"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
    Zap,
    AlertCircle
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
import { useState, useEffect, Suspense } from "react";

// Mock Data
// Mock Data
const ticketTrendData30d = [
    { name: 'Mon', tickets: 24, resolved: 18 },
    { name: 'Tue', tickets: 38, resolved: 28 },
    { name: 'Wed', tickets: 30, resolved: 25 },
    { name: 'Thu', tickets: 45, resolved: 40 },
    { name: 'Fri', tickets: 55, resolved: 48 },
    { name: 'Sat', tickets: 20, resolved: 15 },
    { name: 'Sun', tickets: 15, resolved: 12 },
];

const ticketTrendData7d = [
    { name: 'Mon', tickets: 12, resolved: 10 },
    { name: 'Tue', tickets: 15, resolved: 14 },
    { name: 'Wed', tickets: 22, resolved: 20 },
    { name: 'Thu', tickets: 18, resolved: 16 },
    { name: 'Fri', tickets: 28, resolved: 25 },
    { name: 'Sat', tickets: 10, resolved: 8 },
    { name: 'Sun', tickets: 5, resolved: 5 },
];



const statusDistData = [
    { name: 'Done', value: 1, color: '#10B981' },
    { name: 'In Progress', value: 2, color: '#F59E0B' },
    { name: 'Pending', value: 1, color: '#64748B' },
    { name: 'New', value: 2, color: '#3B82F6' },
    { name: 'Overdue', value: 1, color: '#000000' },
    { name: 'Closed', value: 0, color: '#3E2723' },
];

import { MOCK_PRODUCTS } from "@/lib/data";

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
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm group relative overflow-hidden">
            {/* Subtle background shine */}

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 transition-all duration-300 shadow-sm border border-slate-100">
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
                <h3 className="text-4xl font-extrabold tracking-tighter text-slate-800 transition-all duration-300">
                    {value}
                </h3>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mt-2">{title}</p>
            </div>
        </div>
    );
}

function ProductStatCard({ id, name, total, active, url }: { id?: string, name: string, total: number, active: number, url?: string }) {
    const router = useRouter();
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm group">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 transition-all duration-300 shadow-sm">
                        <Package size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-base text-slate-800 transition-colors">{name}</h4>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Software Product</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push(`/dashboard/products?search=${encodeURIComponent(name)}`)}
                    className="text-slate-300 hover:text-slate-600 transition-colors"
                >
                    <MoreHorizontal size={18} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6 my-6">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Total Tickets</p>
                    <p className="text-2xl font-extrabold text-slate-700">{total}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Active Issues</p>
                    <p className="text-2xl font-extrabold text-[#1500FF]">{active}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
                <button
                    onClick={() => router.push(url || `/dashboard?product=${id || name.toLowerCase().replace(/\s+/g, '-')}`)}
                    className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-between transition-colors"
                >
                    View Dashboard <ArrowRight size={14} className="text-slate-400" />
                </button>
            </div>
        </div>
    );
}

import { useAuth } from "../context/AuthContext";
import { getStoredLogs, formatRelativeTime } from "@/lib/activity";
import { ROLES } from "@/lib/auth";
import { getStoredTickets } from "@/lib/tickets";


function DashboardContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [greeting, setGreeting] = useState("Welcome back");
    const [filterRange, setFilterRange] = useState<"30d" | "7d">("30d");
    const [activities, setActivities] = useState<any[]>([]);
    const [timeTick, setTimeTick] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setTimeTick(Date.now()), 60000);
        return () => clearInterval(timer);
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
            setActivities(filtered.slice(0, 5));
        };

        refresh();
        window.addEventListener('activityUpdated', refresh);
        return () => window.removeEventListener('activityUpdated', refresh);
    }, [user]);

    const searchParams = useSearchParams();
    const productIdParam = searchParams.get('product');

    // Combine Mock Data with potentially LocalStorage data
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    // --- Date Filtering Logic ---
    const [dateFilterType, setDateFilterType] = useState<'this_week' | 'last_week' | 'this_month' | 'custom'>('this_week');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });

    // Helper to get start/end dates based on filter
    const getDateRange = () => {
        const now = new Date();
        const start = new Date(now);
        const end = new Date(now);

        // Reset hours for accurate comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        if (dateFilterType === 'custom') {
            return {
                start: customRange.start ? new Date(customRange.start) : new Date('2000-01-01'),
                end: customRange.end ? new Date(customRange.end) : new Date()
            };
        }

        if (dateFilterType === 'this_week') {
            // Monday of this week
            const day = start.getDay() || 7; // make Sun=7
            if (day !== 1) start.setHours(-24 * (day - 1));
            // End is today/end of week
        } else if (dateFilterType === 'last_week') {
            const day = start.getDay() || 7;
            start.setDate(now.getDate() - day - 6 + 1); // Last Monday
            end.setDate(now.getDate() - day); // Last Sunday
        } else if (dateFilterType === 'this_month') {
            start.setDate(1);
        }

        return { start, end };
    };

    // Helper to parse ticket dates safely
    const parseDate = (str: string): Date => {
        const today = new Date();
        if (!str) return today;
        const s = str.toLowerCase();
        if (s.includes("min") || s.includes("hr") || s.includes("now")) return today;
        if (s.includes("yesterday")) {
            const d = new Date(); d.setDate(d.getDate() - 1); return d;
        }
        const daysMatch = s.match(/(\d+)\s+days?\s+ago/);
        if (daysMatch) {
            const d = new Date(); d.setDate(d.getDate() - parseInt(daysMatch[1])); return d;
        }
        // Try parsing ISO/Standard first
        const d = new Date(str);
        if (!isNaN(d.getTime())) return d;

        // Fallback for custom formats if needed
        const d2 = new Date(str.split(" · ")[0]);
        return isNaN(d2.getTime()) ? today : d2;
    };

    const [realTickets, setRealTickets] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('products');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setProducts(prev => ({ ...prev, ...parsed }));
            } catch (e) { console.error("Failed to load products", e); }
        }
    }, []);

    // Load Tickets for real stats
    useEffect(() => {
        const loadTickets = async () => {
            const t = await getStoredTickets();
            setRealTickets(t);
        };
        loadTickets();
        window.addEventListener('ticketsUpdated', loadTickets);
        return () => window.removeEventListener('ticketsUpdated', loadTickets);
    }, []);

    // Determine which product data to show.
    const effectiveProductId = productIdParam || user?.productId;
    const productData = effectiveProductId ? products[effectiveProductId] : null;

    // Filter tickets for current view
    const currentViewTickets = realTickets.filter(t => {
        if (!effectiveProductId) return true; // Show all if no specific product selected
        const pName = products[effectiveProductId]?.name;
        // Match by Product Name (Ticket uses name like "Phincon", Product uses ID as key but has name property)
        return t.product === pName;
    });

    // 1. Filter tickets by Date Range
    const { start: filterStart, end: filterEnd } = getDateRange();
    const dateFilteredTickets = currentViewTickets.filter(t => {
        const tDate = parseDate(t.createdAt);
        return tDate >= filterStart && tDate <= filterEnd;
    });

    const calcStats = {
        total: dateFilteredTickets.length,
        // Strict counts to match Ticket Tabs
        new: dateFilteredTickets.filter((t: any) => t.status === 'New').length,
        pending: dateFilteredTickets.filter((t: any) => t.status === 'Pending').length,
        inProgress: dateFilteredTickets.filter((t: any) => t.status === 'In Progress').length,
        overdue: dateFilteredTickets.filter((t: any) => t.status === 'Overdue').length,
        closed: dateFilteredTickets.filter((t: any) => t.status === 'Closed').length,
        // Done count for the success metric
        resolvedGroup: dateFilteredTickets.filter((t: any) => t.status === 'Done').length,
        satisfaction: productData?.stats?.satisfaction || "4.9/5.0"
    };



    // 2. Generate Chart Data (Mon-Sun Aggregation)
    // We want 7 buckets: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trendData = weekDays.map(dayName => ({ name: dayName, tickets: 0, resolved: 0 }));

    dateFilteredTickets.forEach(t => {
        const d = parseDate(t.createdAt);
        // getDay(): 0=Sun, 1=Mon... 6=Sat
        // We want Mon=0, Sun=6
        let dayIndex = d.getDay() - 1;
        if (dayIndex === -1) dayIndex = 6; // Sunday

        if (trendData[dayIndex]) {
            trendData[dayIndex].tickets++;
            if (t.status === 'Done') {
                trendData[dayIndex].resolved++;
            }
        }
    });

    const currentTrendData = trendData;

    // Recalculate stats based on DATE FILTERED tickets (optional, but usually desired if filtering chart)
    // If the user wants the "Quick Stats" on top to reflect the filter, we use dateFilteredTickets.
    // If stats should be "All Time" but chart is filtered, we use currentViewTickets.
    // Usually dashboard stats match the view context. Let's update `calcStats` to use `dateFilteredTickets`?
    // User request was specific to "Weekly Ticket Volume" chart modification. 
    // However, consistency suggests stats should match. Let's keep stats as "All Time" for the Cards to show overall health,
    // unless the user explicitly asks for stats filtering.
    // The previous prompt said "Total Tickets... disesuaiin sama total keseluruhan tiket", implying global totals.
    // So we KEEP `calcStats` using `currentViewTickets` (Global for Product) and ONLY filter the chart.

    // Dynamic Distribution Data
    const dynamicDistData = [
        { name: 'New', value: calcStats.new, color: '#3B82F6' },
        { name: 'Pending', value: calcStats.pending, color: '#64748B' },
        { name: 'In Progress', value: calcStats.inProgress, color: '#F59E0B' },
        { name: 'Done', value: calcStats.resolvedGroup, color: '#10B981' },
        { name: 'Overdue', value: calcStats.overdue, color: '#000000' },
        { name: 'Closed', value: calcStats.closed, color: '#3E2723' },
    ];

    const currentDistData = dynamicDistData.length > 0 ? dynamicDistData : (productData ? productData.dist : statusDistData);

    // Fallback info if no tickets exists yet to avoid empty looking charts if user expects mock
    // if (currentViewTickets.length === 0 && !effectiveProductId) {
    //    // Optionally keep using static stats if no real tickets found? 
    //    // No, better to show 0 if it's a real system.
    // }

    // Override the stats object used in render
    const stats = calcStats;

    const activityFeed = activities.length > 0 ? activities : (productData ? productData.activity : [
        { text: "System Online", time: "Stable", user: "System" }
    ]);

    useEffect(() => {
        const updateGreeting = () => {
            // Get current time in Jakarta (WIB)
            const params = { timeZone: 'Asia/Jakarta', hour: 'numeric' as const, hour12: false };
            const hourString = new Intl.DateTimeFormat('en-US', params).format(new Date());
            const hour = parseInt(hourString, 10);

            if (hour < 12) setGreeting("Good Morning");
            else if (hour < 18) setGreeting("Good Afternoon");
            else setGreeting("Good Evening");
        };

        updateGreeting(); // Initial call
        const interval = setInterval(updateGreeting, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const toggleFilter = () => {
        setFilterRange(prev => prev === "30d" ? "7d" : "30d");
    };

    return (
        <div className="min-h-screen pb-12 bg-[#F8FAFC]">
            <Header
                title={effectiveProductId ? `Dashboard: ${productData?.name || effectiveProductId}` : "Overview"}
                subtitle={effectiveProductId ? "Product Specific Performance & Metrics" : "Metrics & Analytics"}
            />

            <motion.main
                variants={containerVariants as any}
                initial="hidden"
                animate="show"
                className="max-w-[1600px] mx-auto px-4 md:px-8 pt-4 pb-8 space-y-10"
            >

                {/* 1. Key Metrics */}
                <section>
                    {(effectiveProductId || (user?.role === 'PRODUCT_ADMIN' && user?.productId)) && (
                        <motion.div variants={itemVariants as any} className="mb-6 p-4 bg-[#1500FF]/5 border border-[#1500FF]/20 rounded-xl flex items-center gap-3 text-[#1500FF]">
                            <Package size={20} />
                            <span className="font-bold text-sm">Viewing Dashboard for Product: <span className="uppercase">{productData?.name || effectiveProductId}</span></span>
                            {productIdParam && <button onClick={() => router.push('/dashboard')} className="ml-auto text-xs font-bold underline hover:no-underline">Back to Overview</button>}
                        </motion.div>
                    )}
                    <motion.div variants={itemVariants as any} className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{greeting}, {user?.name || 'Admin'}</h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">Here's what's happening in your system today.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                                    {[
                                        { id: 'this_week', label: 'This Week' },
                                        { id: 'last_week', label: 'Last Week' },
                                        { id: 'this_month', label: 'Month' },
                                        { id: 'custom', label: 'Custom' },
                                    ].map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setDateFilterType(f.id as any)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${dateFilterType === f.id ? 'bg-white text-[#1500FF] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>

                                {dateFilterType === 'custom' && (
                                    <div className="absolute top-full right-0 mt-3 z-50 bg-white p-4 rounded-2xl border border-slate-100 shadow-xl w-[280px] animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-slate-800">Select Range</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">From Date</label>
                                                <input
                                                    type="date"
                                                    value={customRange.start}
                                                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                                                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] p-2.5 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">To Date</label>
                                                <input
                                                    type="date"
                                                    value={customRange.end}
                                                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                                                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] p-2.5 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <StatsCard title="Total Tickets" value={stats?.total ?? (filterRange === '30d' ? "2,543" : "432")} icon={<Ticket size={24} />} trend={filterRange === '30d' ? "+12%" : "+5%"} trendUp={true} />
                        <StatsCard title="Overdue" value={stats?.overdue ?? "1"} icon={<AlertCircle size={24} className="text-slate-900" />} trend="Action Required" />
                        <StatsCard title="New" value={stats?.new ?? "0"} icon={<Zap size={24} />} />
                        <StatsCard title="In Progress" value={stats?.inProgress ?? "128"} icon={<Clock size={24} />} />
                        <StatsCard title="Done" value={stats?.resolvedGroup ?? (filterRange === '30d' ? "2,312" : "380")} icon={<CheckCircle2 size={24} />} trend="+8%" trendUp={true} />
                    </div>
                </section>

                {/* 2. Charts Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ticket Volume (Area Chart) */}
                    <motion.div variants={itemVariants as any} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Ticket Volume & Performance</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Incoming requests vs resolved
                                </p>
                            </div>

                        </div>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={currentTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                        data={currentDistData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        cornerRadius={8}
                                        stroke="none"
                                    >
                                        {currentDistData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }} itemStyle={{ color: '#334155', fontWeight: 600 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <span className="block text-4xl font-black text-slate-800 tracking-tighter">
                                    {stats ? stats.total : '7'}
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Total</span>
                            </div>
                        </div>
                        <div className="mt-6 space-y-4">
                            {currentDistData.map((item: any) => (
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
                    {/* 3. Product Overview (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <motion.h2 variants={itemVariants as any} className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                                {user?.role === 'SUPER_ADMIN' ? 'Product' : 'My Product Overview'}
                            </motion.h2>
                            {user?.role === 'SUPER_ADMIN' && (
                                <button
                                    onClick={() => router.push('/dashboard/products')}
                                    className="flex items-center gap-2 text-sm font-bold text-[#1500FF] bg-[#1500FF]/5 hover:bg-[#1500FF]/10 px-3 py-1.5 rounded-lg transition-colors border border-[#1500FF]/10"
                                >
                                    <Plus size={16} />
                                    <span>Add New</span>
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {user?.role === 'SUPER_ADMIN' ? (
                                <>
                                    {Object.values(products).map((prod: any) => {
                                        // Dynamic stats for each product in the grid
                                        const pTotal = realTickets.filter(t => t.product === prod.name).length;
                                        const pActive = realTickets.filter(t => t.product === prod.name && ['New', 'In Progress', 'Pending', 'Overdue'].includes(t.status)).length;
                                        return (
                                            <ProductStatCard
                                                key={prod.id}
                                                id={prod.id}
                                                name={prod.name}
                                                total={pTotal}
                                                active={pActive}
                                            />
                                        );
                                    })}


                                </>
                            ) : (
                                <ProductStatCard
                                    id={user?.productId}
                                    name={user?.productId ? (products[user.productId]?.name || user.productId) : "My Product"}
                                    total={calcStats.total}
                                    active={calcStats.inProgress + calcStats.new + calcStats.pending + calcStats.overdue}
                                />
                            )}
                        </div>
                    </div>

                    {/* 4. Action Center & Activity (Sidebar) */}
                    <div className="space-y-8">

                        {/* Quick Data */}
                        <motion.section variants={itemVariants as any} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
                            <h3 className="font-extrabold text-slate-800 mb-6 text-xs uppercase tracking-widest">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/dashboard/tickets')}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-transparent rounded-xl transition-all group duration-300"
                                >
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Create New Ticket</span>
                                    <Plus size={18} className="text-slate-400 group-hover:text-slate-600" />
                                </button>
                                <button
                                    onClick={() => router.push('/dashboard/reports')}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-transparent rounded-xl transition-all group duration-300"
                                >
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Generate Report</span>
                                    <Download size={18} className="text-slate-400 group-hover:text-slate-600" />
                                </button>
                                <button
                                    onClick={() => router.push('/dashboard/admins')}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-transparent rounded-xl transition-all group duration-300"
                                >
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Manage Admins</span>
                                    <Users size={18} className="text-slate-400 group-hover:text-slate-600" />
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
                                {activityFeed.map((item: any, i: number) => {
                                    const t = item.text.toLowerCase();
                                    let dotColor = "bg-slate-300";

                                    if (t.includes('pending')) dotColor = "bg-gray-500";
                                    else if (t.includes('closed')) dotColor = "bg-[#3E2723]";
                                    else if (t.includes('overdue')) dotColor = "bg-black";
                                    else if (t.includes('done') || t.includes('completed')) dotColor = "bg-emerald-500";
                                    else if (t.includes('created') || t.includes('new')) dotColor = "bg-blue-500";
                                    else if (t.includes('progress') || t.includes('in progress')) dotColor = "bg-amber-500";
                                    else if (t.includes('updated') || t.includes('changed') || t.includes('modify')) dotColor = "bg-indigo-500";
                                    else if (t.includes('deleted') || t.includes('removed')) dotColor = "bg-rose-500";

                                    return (
                                        <div key={i} className="pl-8 relative group cursor-pointer hover:-translate-x-[-4px] transition-transform duration-200">
                                            <div className={`absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full border-2 border-white ${dotColor} transition-colors ring-1 ring-slate-100 group-hover:ring-[#1500FF]/30 shadow-sm`} />
                                            <p className="text-sm text-slate-600 font-bold group-hover:text-slate-900 transition-colors leading-relaxed">{item.text}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                                                    {item.timestamp ? formatRelativeTime(item.timestamp) : item.time}
                                                </span>
                                                <span className="w-0.5 h-3 bg-slate-200" />
                                                <span className="text-[11px] text-slate-400 font-bold">{item.user}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.section>
                    </div>
                </div>

            </motion.main >
        </div >
    );
}

export default function SuperAdminDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-400">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
