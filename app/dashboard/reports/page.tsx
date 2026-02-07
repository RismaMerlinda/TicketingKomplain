"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/app/context/AuthContext";
import Header from "@/app/components/Header";
import { getStoredTickets } from "@/lib/tickets";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    FileSpreadsheet,
    FileText,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    Calendar,
    Users,
    Zap,
    ChevronDown,
    X,
    Search
} from "lucide-react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    LineChart,
    Line,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// --- Types ---
interface ReportTicketData {
    id: string;
    subject: string;
    product: string;
    status: 'new' | 'in_progress' | 'pending' | 'overdue' | 'done' | 'closed';
    date: string;
    customer: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    responseTime: number; // in hours
    assignedTo: string;
}


export default function ReportsPage() {
    const { user } = useAuth();
    const [productFilter, setProductFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<'7days' | '30days' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom' | 'all'>('all');
    const [mounted, setMounted] = useState(false);
    const [modalSearch, setModalSearch] = useState(""); // Search state for modal
    useEffect(() => setMounted(true), []);
    const [customStart, setCustomStart] = useState<string>('');
    const [customEnd, setCustomEnd] = useState<string>('');
    const [tempStart, setTempStart] = useState<string>(''); // Temp state for picker
    const [tempEnd, setTempEnd] = useState<string>(''); // Temp state for picker
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // New State
    const [isAllTicketsModalOpen, setIsAllTicketsModalOpen] = useState(false); // Modal State
    const [tickets, setTickets] = useState<ReportTicketData[]>([]);
    const [products, setProducts] = useState<any[]>([]); // Dynamic Products


    // Load Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://127.0.0.1:5900/api/products');
                const contentType = res.headers.get("content-type");
                if (res.ok && contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    setProducts(Object.values(data));
                }
            } catch (e) {
                console.error("Failed to load products", e);
            }
        };
        fetchProducts();
    }, []);


    useEffect(() => {
        const loadToReports = async () => {
            let rawTickets = [];
            let usersMap: Record<string, string> = {};

            // 0. Fetch Users for Admin Name Mapping
            try {
                const userRes = await fetch('http://127.0.0.1:5900/api/users', { cache: 'no-store' });
                if (userRes.ok) {
                    const users = await userRes.json();
                    if (Array.isArray(users)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        users.forEach((u: any) => {
                            if (u.email) usersMap[u.email] = u.name;
                            if (u._id) usersMap[u._id] = u.name;
                            if (u.id) usersMap[u.id] = u.name;
                        });
                    }
                }
            } catch (e) {
                console.warn("Could not fetch users for admin mapping", e);
            }

            try {
                // 1. Try Fetch from API
                const res = await fetch('http://127.0.0.1:5900/api/tickets');
                const contentType = res.headers.get("content-type");
                if (res.ok && contentType && contentType.includes("application/json")) {
                    rawTickets = await res.json();
                } else {
                    console.error("Failed to fetch tickets from API or invalid format");
                }
            } catch (e) {
                console.error("API Error", e);
            }

            // 2. Migration Check: If API empty but LocalStorage has data -> Sync!
            if (rawTickets.length === 0) {
                const stored = await getStoredTickets();
                if (stored && stored.length > 0) {
                    console.log("📦 Migrating tickets to MongoDB...");
                    try {
                        const syncRes = await fetch('http://127.0.0.1:5900/api/tickets/sync', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(stored)
                        });

                        if (syncRes.ok) {
                            console.log("✅ Tickets migrated successfully");
                            rawTickets = stored; // Use local data for immediate render
                        }
                    } catch (err) {
                        console.error("Migration failed", err);
                        rawTickets = stored; // Fallback to local
                    }
                }
            }

            // 3. Map Data for Reports
            const mapped = rawTickets.map((t: any) => {
                let status: ReportTicketData['status'] = 'new';
                const s = t.status?.toLowerCase().replace(/\s+/g, '_') || '';

                if (['new', 'in_progress', 'pending', 'overdue', 'done', 'closed'].includes(s)) {
                    status = s as any;
                } else if (s === 'resolved') {
                    status = 'done';
                }

                // Robust Date Parsing
                let dateStr = new Date().toISOString().split('T')[0]; // Default to today

                try {
                    // Try to parse database standard dates or fallback
                    if (t.createdAt) {
                        // Check if it's "ago" style (Local storage legacy)
                        if (t.createdAt.includes('ago')) {
                            const now = new Date();
                            if (t.createdAt.includes('day')) {
                                const days = parseInt(t.createdAt.match(/\d+/)?.[0] || '0');
                                now.setDate(now.getDate() - days);
                            }
                            const offset = now.getTimezoneOffset() * 60000;
                            dateStr = new Date(now.getTime() - offset).toISOString().split('T')[0];
                        }
                        // Standard ISO Date from Mongo
                        else {
                            const parsed = new Date(t.createdAt);
                            if (!isNaN(parsed.getTime())) {
                                dateStr = parsed.toISOString().split('T')[0];
                            }
                        }
                    }
                    // Legacy Priority Date Fallback
                    else if (t.prioritySetAt && t.prioritySetAt.includes('·')) {
                        // ... existing logic ...
                        // Simplify for robustness:
                        dateStr = new Date().toISOString().split('T')[0];
                    }

                } catch (e) {
                    console.error("Date parse error", e);
                }

                return {
                    id: t.code || t.id,
                    subject: t.title,
                    product: t.product || 'Unknown', // Keep original case for display
                    status,
                    date: dateStr,
                    customer: t.customerName || t.customer || 'Guest',
                    description: t.description || '',
                    priority: (t.priority?.toLowerCase() || 'medium') as any,
                    responseTime: Math.floor(Math.random() * 48) + 1, // Mock response time for now if not tracked
                    assignedTo: usersMap[t.assignedTo] || t.assignedTo || 'Unassigned'
                };
            });
            setTickets(mapped);
        };

        loadToReports();
        // window.addEventListener('ticketsUpdated', loadToReports); // Websocket ideal here, but manual refresh ok for now
        // return () => window.removeEventListener('ticketsUpdated', loadToReports);
    }, []);

    // Filter data based on user role and filters
    const filteredData = useMemo(() => {
        if (!user) return [];
        let data = tickets;

        // Role/Product Filter
        if (user.role === 'PRODUCT_ADMIN' && user.productId) {
            const targetId = user.productId.toLowerCase();
            const pObj = products.find(p => p.id === user.productId);
            const targetName = pObj?.name?.toLowerCase() || "";

            data = data.filter(item => {
                const itemProduct = item.product.toLowerCase();
                return itemProduct === targetId || itemProduct === targetName;
            });
        } else if (user.role === 'SUPER_ADMIN' && productFilter !== 'all') {
            const targetId = productFilter.toLowerCase();
            const pObj = products.find(p => p.id === productFilter);
            const targetName = pObj?.name?.toLowerCase() || "";

            data = data.filter(item => {
                const itemProduct = item.product.toLowerCase();
                return itemProduct === targetId || itemProduct === targetName;
            });
        }


        // Date Range Filter
        // We use the start of the current day to ensure we include today's tickets correctly
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today

        if (dateRange !== 'all') {
            const startDate = new Date(now);
            const endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999); // End of today/selection

            switch (dateRange) {
                case '7days':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case '30days':
                    startDate.setDate(now.getDate() - 30);
                    break;
                case 'thisWeek':
                    // Assuming Monday start
                    const day = now.getDay() || 7; // Get current day number, converting Sun (0) to 7
                    if (day !== 1) startDate.setHours(-24 * (day - 1)); // Go back to Monday
                    break;
                case 'lastWeek':
                    {
                        const day = now.getDay() || 7;
                        startDate.setDate(now.getDate() - day - 6);
                        endDate.setDate(endDate.getDate() - day);
                    }
                    break;
                case 'thisMonth':
                    startDate.setDate(1);
                    break;
                case 'lastMonth':
                    startDate.setMonth(startDate.getMonth() - 1);
                    startDate.setDate(1);
                    endDate.setDate(0); // Last day of previous month
                    break;
                case 'custom':
                    if (customStart) startDate.setTime(new Date(customStart).getTime());
                    else startDate.setTime(0); // Far past if no start

                    if (customEnd) {
                        const end = new Date(customEnd);
                        end.setHours(23, 59, 59, 999);
                        endDate.setTime(end.getTime());
                    }
                    break;
            }

            startDate.setHours(0, 0, 0, 0);

            data = data.filter(item => {
                const itemDate = new Date(item.date);
                itemDate.setHours(0, 0, 0, 0);
                return itemDate >= startDate && itemDate <= endDate;
            });
        }

        return data;
    }, [user, productFilter, dateRange, tickets]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = filteredData.length;
        const newTickets = filteredData.filter(t => t.status === 'new').length;
        const inProgress = filteredData.filter(t => t.status === 'in_progress').length;
        const pending = filteredData.filter(t => t.status === 'pending').length;
        const overdue = filteredData.filter(t => t.status === 'overdue').length;
        const done = filteredData.filter(t => t.status === 'done').length;
        const closed = filteredData.filter(t => t.status === 'closed').length;

        // Effective resolution: done + closed
        const resolvedCount = done + closed;
        const resolutionRate = total > 0 ? (resolvedCount / total * 100) : 0;

        const avgResponseTime = filteredData.reduce((acc, t) => acc + (t.responseTime || 0), 0) / (total || 1);

        return {
            total,
            new: newTickets,
            inProgress,
            pending,
            overdue,
            done,
            closed,
            resolvedCount,
            avgResponseTime: avgResponseTime.toFixed(1),
            resolutionRate: resolutionRate.toFixed(1)
        };
    }, [filteredData]);

    // Filter logic for Modal Search
    const filteredModalTickets = useMemo(() => {
        if (!modalSearch) return filteredData;
        const q = modalSearch.toLowerCase();
        return filteredData.filter(t =>
            t.subject.toLowerCase().includes(q) ||
            t.customer.toLowerCase().includes(q) ||
            t.product.toLowerCase().includes(q) ||
            t.status.toLowerCase().replace('_', ' ').includes(q) ||
            t.id.toString().toLowerCase().includes(q) ||
            (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
        );
    }, [filteredData, modalSearch]);

    // Data for charts
    const statusChartData = [
        { name: 'New', value: stats.new, color: '#3B82F6' },
        { name: 'In Progress', value: stats.inProgress, color: '#F59E0B' },
        { name: 'Pending', value: stats.pending, color: '#64748B' },
        { name: 'Overdue', value: stats.overdue, color: '#EF4444' },
        { name: 'Done', value: stats.done, color: '#10B981' },
        { name: 'Closed', value: stats.closed, color: '#1F2937' },
    ].filter(item => item.value > 0);

    const productChartData = useMemo(() => {
        let productList = [];

        if (products.length > 0) {
            productList = products.map(p => ({ key: p.id, label: p.name }));
        } else {
            // Fallback while loading or if empty
            productList = [
                { key: 'orbit', label: 'Orbit Billiard' },
                { key: 'catatmak', label: 'Catatmak' },
                { key: 'joki', label: 'Joki Informatika' }
            ];
        }

        return productList.map(p => {
            // Use strict matching for accuracy
            const targetId = p.key.toLowerCase();
            const targetName = p.label.toLowerCase();

            const productTickets = filteredData.filter(t => {
                const itemProduct = t.product.toLowerCase();
                return itemProduct === targetId || itemProduct === targetName;
            });

            return {
                name: p.label,
                total: productTickets.length,
                new: productTickets.filter(t => t.status === 'new').length,
                inProgress: productTickets.filter(t => t.status === 'in_progress').length,
                pending: productTickets.filter(t => t.status === 'pending').length,
                overdue: productTickets.filter(t => t.status === 'overdue').length,
                done: productTickets.filter(t => t.status === 'done').length,
                closed: productTickets.filter(t => t.status === 'closed').length,
            };
        });

    }, [filteredData, products]);

    const trendData = useMemo(() => {
        const today = new Date();
        const offset = today.getTimezoneOffset() * 60000;
        let start = new Date(today);
        let days = 7;

        switch (dateRange) {
            case '7days':
                start.setDate(today.getDate() - 6);
                days = 7;
                break;
            case '30days':
                start.setDate(today.getDate() - 29);
                days = 30;
                break;
            case 'thisWeek':
                const day = today.getDay() || 7;
                start.setDate(today.getDate() - day + 1);
                days = day; // Show up to today
                break;
            case 'lastWeek':
                const d = today.getDay() || 7;
                start.setDate(today.getDate() - d - 6);
                days = 7;
                break;
            case 'thisMonth':
                start.setDate(1);
                days = today.getDate();
                break;
            case 'lastMonth':
                start.setMonth(start.getMonth() - 1);
                start.setDate(1);
                const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
                days = lastDay;
                break;
            case 'custom':
                if (customStart && customEnd) {
                    start = new Date(customStart);
                    const end = new Date(customEnd);
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                }
                break;
            case 'all':
                // For all time, we might just show last 30 days or handle differently
                // For simplicity, sticking to last 30
                start.setDate(today.getDate() - 29);
                days = 30;
                break;
        }

        const dateArray = Array.from({ length: days }, (_, i) => {
            const d = new Date(start.getTime());
            d.setDate(d.getDate() + i);
            const localD = new Date(d.getTime() - offset);
            return localD.toISOString().split('T')[0];
        });

        return dateArray.map(dateStr => {
            const [year, month, day] = dateStr.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);

            return {
                date: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                tickets: filteredData.filter(t => t.date === dateStr).length,
            };
        });
    }, [filteredData, dateRange, customStart, customEnd]);

    // Export handlers
    const handleExportExcel = () => {
        // Prepare data
        const exportData = filteredData.map(ticket => ({
            'ID': ticket.id,
            'Product': ticket.product.toUpperCase(),
            'Subject': ticket.subject,
            'Status': ticket.status.replace('_', ' ').toUpperCase(),
            'Priority': ticket.priority.toUpperCase(),
            'Customer': ticket.customer,
            'Date': ticket.date,
            'Response Time (hrs)': ticket.responseTime,
            'Description': ticket.description
        }));

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Add tickets sheet
        const ws1 = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws1, "Tickets");

        // Add summary sheet
        const summaryData = [
            { Metric: 'Total Tickets', Value: stats.total },
            { Metric: 'New', Value: stats.new },
            { Metric: 'In Progress', Value: stats.inProgress },
            { Metric: 'Pending', Value: stats.pending },
            { Metric: 'Overdue', Value: stats.overdue },
            { Metric: 'Done', Value: stats.done },
            { Metric: 'Closed', Value: stats.closed },
            { Metric: 'Resolution Rate (%)', Value: stats.resolutionRate },
            { Metric: 'Avg Response Time (hrs)', Value: stats.avgResponseTime },
        ];
        const ws2 = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws2, "Summary");

        // Download
        XLSX.writeFile(wb, `Ticketing_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(21, 0, 255);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text("Ticketing System Report", 14, 20);

        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

        // Summary Statistics Box
        doc.setFillColor(248, 250, 252);
        doc.rect(14, 50, 182, 45, 'F');

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text("Summary Statistics", 20, 60);

        doc.setFontSize(9);
        const summaryY = 70;
        doc.text(`Total Tickets: ${stats.total}`, 20, summaryY);
        doc.text(`New: ${stats.new}`, 20, summaryY + 6);
        doc.text(`In Progress: ${stats.inProgress}`, 20, summaryY + 12);

        doc.text(`Pending: ${stats.pending}`, 70, summaryY + 6);
        doc.text(`Overdue: ${stats.overdue}`, 70, summaryY + 12);

        doc.text(`Done: ${stats.done}`, 120, summaryY + 6);
        doc.text(`Closed: ${stats.closed}`, 120, summaryY + 12);

        doc.text(`Avg Resp: ${stats.avgResponseTime}h`, 170, summaryY + 6);
        doc.text(`Rate: ${stats.resolutionRate}%`, 170, summaryY + 12);

        // Tickets Table
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text("Ticket Details", 14, 110);

        const tableColumn = ["ID", "Product", "Subject", "Status", "Priority", "Date"];
        const tableRows = filteredData.map(ticket => [
            ticket.id,
            ticket.product.toUpperCase(),
            ticket.subject.substring(0, 30) + (ticket.subject.length > 30 ? '...' : ''),
            ticket.status.replace('_', ' ').toUpperCase(),
            ticket.priority.toUpperCase(),
            ticket.date
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 115,
            theme: 'grid',
            headStyles: {
                fillColor: [21, 0, 255],
                fontSize: 9,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 8,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 25 },
                2: { cellWidth: 60 },
                3: { cellWidth: 30 },
                4: { cellWidth: 25 },
                5: { cellWidth: 25 }
            }
        });

        // Footer
        const pageCount = doc.internal.pages.length - 1;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('Confidential - Internal Use Only', 105, 285, { align: 'center' });
        }

        doc.save(`Ticketing_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header title="Analytics & Reports" subtitle="Comprehensive ticket analytics and insights" />

            <div className="max-w-7xl mx-auto px-4 py-6 md:p-6 space-y-6">

                {/* Control Bar */}
                <div className="flex flex-col lg:flex-row lg:items-start xl:items-center justify-between gap-4 lg:gap-6 bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl border border-white/50 shadow-sm sticky top-20 z-20 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-3.5">
                        <div className="p-2.5 md:p-3.5 bg-gradient-to-br from-[#1500FF] to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-50">
                            <BarChart3 className="text-white w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Report Dashboard</h2>
                            <p className="text-xs md:text-sm text-slate-500 font-medium">Visual analytics & data export</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                        {/* Date Range Filter */}
                        <div className="relative z-20 w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    if (!isDatePickerOpen) {
                                        setTempStart(customStart);
                                        setTempEnd(customEnd);
                                    }
                                    setIsDatePickerOpen(!isDatePickerOpen);
                                }}
                                className={`flex items-center justify-between gap-3 bg-white border text-sm font-bold py-2.5 md:py-3 px-4 md:px-5 rounded-xl transition-all shadow-sm w-full min-w-[200px] ${isDatePickerOpen ? 'border-[#1500FF] ring-4 ring-[#1500FF]/10 text-[#1500FF]' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Calendar size={18} className={isDatePickerOpen ? "text-[#1500FF]" : "text-slate-400"} />
                                    <span className="truncate">
                                        {dateRange === 'custom' && customStart && customEnd
                                            ? `${new Date(customStart).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })} - ${new Date(customEnd).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}`
                                            : {
                                                '7days': 'Last 7 Days',
                                                '30days': 'Last 30 Days',
                                                'thisWeek': 'This Week',
                                                'lastWeek': 'Last Week',
                                                'thisMonth': 'This Month',
                                                'lastMonth': 'Last Month',
                                                'custom': 'Custom Range',
                                                'all': 'All Time'
                                            }[dateRange] || "Select Date"
                                        }
                                    </span>
                                </div>
                                <ChevronDown size={16} className={`transition-transform duration-300 ${isDatePickerOpen ? 'rotate-180 text-[#1500FF]' : 'text-slate-400'}`} />
                            </button>

                            <AnimatePresence>
                                {isDatePickerOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsDatePickerOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 left-0 sm:left-auto top-full mt-2 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-4 sm:w-[320px] z-30 flex flex-col gap-2"
                                        >
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                {['7days', '30days', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'all'].map((key) => {
                                                    const labels: any = {
                                                        '7days': 'Last 7 Days', '30days': 'Last 30 Days', 'thisWeek': 'This Week',
                                                        'lastWeek': 'Last Week', 'thisMonth': 'This Month', 'lastMonth': 'Last Month', 'all': 'All Time'
                                                    };
                                                    return (
                                                        <button
                                                            key={key}
                                                            onClick={() => { setDateRange(key as any); setIsDatePickerOpen(false); }}
                                                            className={`px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left border ${dateRange === key ? 'bg-[#1500FF] border-[#1500FF] text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-100' : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-100'}`}
                                                        >
                                                            {labels[key]}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="border-t border-slate-100 pt-4 mt-1">
                                                <div className="flex items-center justify-between mb-3 px-1">
                                                    <div className="flex items-center gap-2">
                                                        <Filter size={12} className="text-[#1500FF]" />
                                                        <p className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Custom Range</p>
                                                    </div>
                                                    {dateRange === 'custom' && <span className="flex h-2 w-2 rounded-full bg-[#1500FF] ring-4 ring-blue-50" />}
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] text-slate-500 font-bold ml-1">From</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="date"
                                                                    value={tempStart}
                                                                    onChange={e => setTempStart(e.target.value)}
                                                                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#1500FF] focus:ring-4 focus:ring-[#1500FF]/5 transition-all text-center placeholder-transparent"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] text-slate-500 font-bold ml-1">To</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="date"
                                                                    value={tempEnd}
                                                                    onChange={e => setTempEnd(e.target.value)}
                                                                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#1500FF] focus:ring-4 focus:ring-[#1500FF]/5 transition-all text-center"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setCustomStart(tempStart);
                                                            setCustomEnd(tempEnd);
                                                            setDateRange('custom');
                                                            setIsDatePickerOpen(false);
                                                        }}
                                                        className="w-full bg-[#1500FF] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        Apply Date Filter
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Product Filter */}
                        {user.role === 'SUPER_ADMIN' && (
                            <select
                                value={productFilter}
                                onChange={(e) => setProductFilter(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-600 text-sm font-bold py-2.5 md:py-3 px-4 md:px-5 pr-10 rounded-xl hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#1500FF]/10 focus:border-[#1500FF] cursor-pointer transition-all shadow-sm w-full sm:w-auto"
                            >
                                <option value="all">All Products</option>
                                {products.length > 0 ? (
                                    products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="orbit">Orbit Billiard</option>
                                        <option value="catatmak">Catatmak</option>
                                        <option value="joki">Joki Informatika</option>
                                    </>
                                )}
                            </select>
                        )}

                        {/* Export Buttons */}
                        <div className="grid grid-cols-2 sm:flex bg-white rounded-xl border border-slate-200 p-1 md:p-1.5 shadow-sm w-full sm:w-auto">
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all w-full sm:w-auto"
                                title="Export to Excel"
                            >
                                <FileSpreadsheet size={18} />
                                <span className="inline">Excel</span>
                            </button>
                            <div className="hidden sm:block w-px bg-slate-200 my-1 mx-0.5 md:mx-1"></div>
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all w-full sm:w-auto border-l border-slate-100 sm:border-l-0"
                                title="Export to PDF"
                            >
                                <FileText size={18} />
                                <span className="inline">PDF</span>
                            </button>
                        </div>
                    </div>
                </div>


                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Distribution - Pie Chart */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-purple-50 rounded-xl">
                                    <PieChartIcon className="text-purple-600" size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">Status Distribution</h3>
                                    <p className="text-xs font-medium text-slate-500">Breakdown by current status</p>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80} // Donut style
                                    outerRadius={110}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                        padding: '12px',
                                        fontSize: '12px'
                                    }}
                                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Product Performance - Bar Chart */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-indigo-50 rounded-xl">
                                    <BarChart3 className="text-indigo-600" size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">Product Performance</h3>
                                    <p className="text-xs font-medium text-slate-500">Ticket volume by product</p>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={productChartData} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                <Bar dataKey="new" stackId="a" fill="#3B82F6" name="New" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="inProgress" stackId="a" fill="#F59E0B" name="In Progress" />
                                <Bar dataKey="pending" stackId="a" fill="#64748B" name="Pending" />
                                <Bar dataKey="overdue" stackId="a" fill="#EF4444" name="Overdue" />
                                <Bar dataKey="done" stackId="a" fill="#10B981" name="Done" />
                                <Bar dataKey="closed" stackId="a" fill="#1F2937" name="Closed" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trend Line Chart */}
                {/* Trend Line Chart */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-cyan-50 rounded-xl">
                                <TrendingUp className="text-cyan-600" size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">
                                    {(() => {
                                        const labels: Record<string, string> = {
                                            '7days': 'Last 7 Days',
                                            '30days': 'Last 30 Days',
                                            'thisWeek': 'This Week',
                                            'lastWeek': 'Last Week',
                                            'thisMonth': 'This Month',
                                            'lastMonth': 'Last Month',
                                            'custom': 'Custom Range',
                                            'all': 'All Time'
                                        };
                                        return `Ticket Trend (${labels[dateRange] || dateRange})`;
                                    })()}
                                </h3>
                                <p className="text-xs font-medium text-slate-500">Daily ticket volume analysis</p>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                    padding: '12px',
                                    fontWeight: 'bold'
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            <Line
                                type="monotone"
                                dataKey="tickets"
                                stroke="#06b6d4"
                                strokeWidth={4}
                                dot={{ fill: '#white', stroke: '#06b6d4', strokeWidth: 3, r: 6 }}
                                activeDot={{ r: 8, fill: '#06b6d4', stroke: '#fff', strokeWidth: 3 }}
                                name="Tickets Created"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-12">
                    <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-slate-50 rounded-xl">
                                <Users className="text-slate-600" size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Recent Tickets Summary</h3>
                                <p className="text-xs font-medium text-slate-500">Top 10 recent entries</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAllTicketsModalOpen(true)}
                            className="text-sm font-bold text-[#1500FF] hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Response</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredData.slice(0, 10).map((ticket, i) => (
                                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-700 group-hover:text-[#1500FF] transition-colors">
                                            #{ticket.id.toString().slice(-4)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                                                {ticket.product}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-medium text-slate-700 max-w-[200px] truncate">{ticket.subject}</div>
                                            <div className="text-xs text-slate-500 mt-1">{ticket.customer}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize border ${ticket.status === 'done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                ticket.status === 'closed' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                    ticket.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        ticket.status === 'in_progress' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            ticket.status === 'new' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                'bg-slate-50 text-slate-500 border-slate-200' // Pending
                                                }`}>
                                                {ticket.status === 'done' || ticket.status === 'closed' ? <CheckCircle2 size={12} /> :
                                                    ticket.status === 'overdue' ? <AlertCircle size={12} /> :
                                                        ticket.status === 'in_progress' ? <Activity size={12} /> :
                                                            <Clock size={12} />}
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' :
                                                    ticket.priority === 'medium' ? 'bg-amber-400' :
                                                        'bg-emerald-400'
                                                    }`} />
                                                <span className="text-sm font-bold text-slate-600 capitalize">{ticket.priority}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-bold text-slate-600">{ticket.responseTime}h</span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-500">
                                            {new Date(ticket.date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* View All Modal */}
                {mounted && createPortal(
                    <AnimatePresence>
                        {isAllTicketsModalOpen && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsAllTicketsModalOpen(false)}
                                    className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                                >
                                    <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 gap-4">
                                        <div className="min-w-fit">
                                            <h2 className="text-xl font-bold text-slate-800">All Recent Tickets</h2>
                                            <p className="text-sm text-slate-500 font-medium mt-1">Showing {filteredModalTickets.length} tickets</p>
                                        </div>

                                        <div className="relative flex-1 max-w-md mx-4">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder="Search tickets..."
                                                value={modalSearch}
                                                onChange={(e) => setModalSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
                                            />
                                        </div>

                                        <button
                                            onClick={() => setIsAllTicketsModalOpen(false)}
                                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-auto">
                                        <table className="w-full">
                                            <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Response</th>
                                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {filteredModalTickets.length > 0 ? (
                                                    filteredModalTickets.map((ticket, i) => (
                                                        <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors group">
                                                            <td className="px-8 py-5 text-sm font-bold text-slate-700 group-hover:text-[#1500FF] transition-colors">
                                                                #{ticket.id.toString().slice(-4)}
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                                                                    {ticket.product}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="text-sm font-medium text-slate-700 max-w-[200px] truncate">{ticket.subject}</div>
                                                                <div className="text-xs text-slate-500 mt-1">{ticket.customer}</div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize border ${ticket.status === 'done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                    ticket.status === 'closed' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                                        ticket.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                            ticket.status === 'in_progress' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                                ticket.status === 'new' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                                    'bg-slate-50 text-slate-500 border-slate-200' // Pending
                                                                    }`}>
                                                                    {ticket.status === 'done' || ticket.status === 'closed' ? <CheckCircle2 size={12} /> :
                                                                        ticket.status === 'overdue' ? <AlertCircle size={12} /> :
                                                                            ticket.status === 'in_progress' ? <Activity size={12} /> :
                                                                                <Clock size={12} />}
                                                                    {ticket.status.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' :
                                                                        ticket.priority === 'medium' ? 'bg-amber-400' :
                                                                            'bg-emerald-400'
                                                                        }`} />
                                                                    <span className="text-sm font-bold text-slate-600 capitalize">{ticket.priority}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className="text-sm font-bold text-slate-600">{ticket.responseTime}h</span>
                                                            </td>
                                                            <td className="px-8 py-5 text-sm font-medium text-slate-500">
                                                                {new Date(ticket.date).toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="px-8 py-12 text-center text-slate-400">
                                                            <div className="flex flex-col items-center justify-center gap-2">
                                                                <Search size={32} className="text-slate-200" />
                                                                <p>No tickets found for "{modalSearch}"</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}

            </div>
        </div>
    );
}
