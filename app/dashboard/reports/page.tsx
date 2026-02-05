"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Header from "@/app/components/Header";
import { getStoredTickets } from "@/lib/tickets";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
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
    Zap
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
    status: 'resolved' | 'pending' | 'in_progress' | 'critical';
    date: string;
    customer: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    responseTime: number; // in hours
}


export default function ReportsPage() {
    const { user } = useAuth();
    const [productFilter, setProductFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('30days');
    const [tickets, setTickets] = useState<ReportTicketData[]>([]);

    useEffect(() => {
        const loadToReports = () => {
            const stored = getStoredTickets();
            const mapped = stored.map((t: any) => {
                let status: ReportTicketData['status'] = 'pending';
                const s = t.status?.toLowerCase() || '';
                if (s === 'new' || s === 'pending') status = 'pending';
                else if (s === 'in progress') status = 'in_progress';
                else if (s === 'overdue') status = 'critical';
                else if (s === 'done' || s === 'closed' || s === 'resolved') status = 'resolved';

                // Robust Date Parsing
                let dateStr = new Date().toISOString().split('T')[0]; // Default to today

                try {
                    // 1. Try "ago" in createdAt (Relative Logic) - Matches TicketsPage mock data style
                    if (t.createdAt && t.createdAt.includes('ago')) {
                        const now = new Date();
                        if (t.createdAt.includes('day')) {
                            // "1 day ago", "2 days ago"
                            const days = parseInt(t.createdAt.match(/\d+/)?.[0] || '0');
                            now.setDate(now.getDate() - days);
                        }
                        // "mins ago", "hrs ago" -> treated as Today
                        const offset = now.getTimezoneOffset() * 60000;
                        dateStr = new Date(now.getTime() - offset).toISOString().split('T')[0];
                    }
                    // 2. Try prioritySetAt (Format: "05 Feb 2026 · 09:00") - Explicit Logic
                    else if (t.prioritySetAt && t.prioritySetAt.includes('·')) {
                        const datePart = t.prioritySetAt.split('·')[0].trim();
                        // Attempt to parse "12 Feb 2026"
                        const enDatePart = datePart
                            .replace(/Mei/i, 'May')
                            .replace(/Agu/i, 'Aug')
                            .replace(/Okt/i, 'Oct')
                            .replace(/Des/i, 'Dec');

                        const parsed = new Date(enDatePart);
                        if (!isNaN(parsed.getTime())) {
                            const offset = parsed.getTimezoneOffset() * 60000;
                            dateStr = new Date(parsed.getTime() - offset).toISOString().split('T')[0];
                        }
                    }
                    // 3. Fallback to createdAt standard date
                    else if (t.createdAt && !t.createdAt.includes('WIB')) {
                        const parsed = new Date(t.createdAt);
                        if (!isNaN(parsed.getTime())) {
                            dateStr = parsed.toISOString().split('T')[0];
                        }
                    }
                } catch (e) {
                    console.error("Date parse error", e);
                }

                return {
                    id: t.code || t.id,
                    subject: t.title,
                    product: t.product, // Keep original case for display
                    status,
                    date: dateStr,
                    customer: t.customer,
                    description: t.description || '',
                    priority: (t.priority?.toLowerCase() || 'medium') as any,
                    responseTime: Math.floor(Math.random() * 48) + 1 // Mock response time for now
                };
            });
            setTickets(mapped);
        };

        loadToReports();
        window.addEventListener('ticketsUpdated', loadToReports);
        return () => window.removeEventListener('ticketsUpdated', loadToReports);
    }, []);

    // Filter data based on user role and filters
    const filteredData = useMemo(() => {
        if (!user) return [];
        let data = tickets;

        // Role/Product Filter
        if (user.role === 'PRODUCT_ADMIN' && user.productId) {
            data = data.filter(item => item.product.toLowerCase().includes(user.productId?.toLowerCase() || ''));
        } else if (user.role === 'SUPER_ADMIN' && productFilter !== 'all') {
            data = data.filter(item => item.product.toLowerCase().includes(productFilter.toLowerCase()));
        }

        // Date Range Filter
        // We use the start of the current day to ensure we include today's tickets correctly
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today

        if (dateRange !== 'all') {
            const daysAgo = dateRange === '7days' ? 7 : 30;
            const cutoffDate = new Date(now);
            cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

            data = data.filter(item => {
                const itemDate = new Date(item.date);
                itemDate.setHours(0, 0, 0, 0);
                return itemDate >= cutoffDate;
            });
        }

        return data;
    }, [user, productFilter, dateRange, tickets]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = filteredData.length;
        const resolved = filteredData.filter(t => t.status === 'resolved').length;
        const critical = filteredData.filter(t => t.status === 'critical').length;
        const inProgress = filteredData.filter(t => t.status === 'in_progress').length;
        const pending = filteredData.filter(t => t.status === 'pending').length;
        const avgResponseTime = filteredData.reduce((acc, t) => acc + t.responseTime, 0) / (total || 1);
        const resolutionRate = total > 0 ? (resolved / total * 100) : 0;

        return {
            total,
            resolved,
            critical,
            inProgress,
            pending,
            avgResponseTime: avgResponseTime.toFixed(1),
            resolutionRate: resolutionRate.toFixed(1)
        };
    }, [filteredData]);

    // Data for charts
    const statusChartData = [
        { name: 'Resolved', value: stats.resolved, color: '#10b981' },
        { name: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
        { name: 'Pending', value: stats.pending, color: '#6b7280' },
        { name: 'Critical', value: stats.critical, color: '#ef4444' },
    ];

    const productChartData = useMemo(() => {
        const products = [
            { key: 'orbit', label: 'Orbit Billiard' },
            { key: 'catatmak', label: 'Catatmak' },
            { key: 'joki', label: 'Joki Informatika' }
        ];

        return products.map(p => {
            const productTickets = filteredData.filter(t => t.product.toLowerCase().includes(p.key));
            return {
                name: p.label,
                tickets: productTickets.length,
                resolved: productTickets.filter(t => t.status === 'resolved').length,
            };
        });
    }, [filteredData]);

    const trendData = useMemo(() => {
        // Use the same timezone correction logic as the data parser to ensures keys match
        const today = new Date();
        const offset = today.getTimezoneOffset() * 60000;

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today.getTime());
            d.setDate(d.getDate() - (6 - i));
            // Create a date object that represents "Local Time" but in UTC fields so conversion to ISO String preserves the local YYYY-MM-DD
            const localD = new Date(d.getTime() - offset);
            return localD.toISOString().split('T')[0];
        });

        return last7Days.map(dateStr => {
            // Construct local date explicitly to ensure formatting is consistent
            const [year, month, day] = dateStr.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);

            return {
                date: dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
                tickets: filteredData.filter(t => t.date === dateStr).length,
            };
        });
    }, [filteredData]);

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
            { Metric: 'Resolved', Value: stats.resolved },
            { Metric: 'In Progress', Value: stats.inProgress },
            { Metric: 'Pending', Value: stats.pending },
            { Metric: 'Critical', Value: stats.critical },
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
        doc.text(`Resolved: ${stats.resolved}`, 20, summaryY + 6);
        doc.text(`In Progress: ${stats.inProgress}`, 20, summaryY + 12);

        doc.text(`Critical: ${stats.critical}`, 80, summaryY);
        doc.text(`Pending: ${stats.pending}`, 80, summaryY + 6);
        doc.text(`Resolution Rate: ${stats.resolutionRate}%`, 80, summaryY + 12);

        doc.text(`Avg Response Time: ${stats.avgResponseTime} hours`, 140, summaryY);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
            <Header title="Analytics & Reports" subtitle="Comprehensive ticket analytics and insights" />

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 space-y-8">

                {/* Control Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-lg sticky top-24 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-[#1500FF] to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                            <BarChart3 className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Report Dashboard</h2>
                            <p className="text-xs text-slate-500">Visual analytics & data export</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Date Range Filter */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as any)}
                            className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2.5 px-4 pr-10 rounded-xl hover:border-[#1500FF]/50 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 cursor-pointer"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>

                        {/* Product Filter - Super Admin Only */}
                        {user.role === 'SUPER_ADMIN' && (
                            <select
                                value={productFilter}
                                onChange={(e) => setProductFilter(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2.5 px-4 pr-10 rounded-xl hover:border-[#1500FF]/50 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 cursor-pointer"
                            >
                                <option value="all">All Products</option>
                                <option value="orbit">Orbit Billiard</option>
                                <option value="catatmak">Catatmak</option>
                                <option value="joki">Joki Informatika</option>
                            </select>
                        )}

                        {/* Export Buttons */}
                        <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
                                title="Export to Excel"
                            >
                                <FileSpreadsheet size={16} />
                                <span>Excel</span>
                            </button>
                            <div className="w-2"></div>
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                                title="Export to PDF"
                            >
                                <FileText size={16} />
                                <span>PDF</span>
                            </button>
                        </div>
                    </div>
                </div>


                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Distribution - Pie Chart */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <PieChartIcon className="text-purple-600" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Status Distribution</h3>
                                <p className="text-xs text-slate-500">Breakdown by ticket status</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Product Performance - Bar Chart */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <BarChart3 className="text-indigo-600" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Product Performance</h3>
                                <p className="text-xs text-slate-500">Tickets by product</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={productChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="tickets" fill="#1500FF" radius={[8, 8, 0, 0]} name="Total Tickets" />
                                <Bar dataKey="resolved" fill="#10b981" radius={[8, 8, 0, 0]} name="Resolved" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trend Line Chart */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                            <TrendingUp className="text-cyan-600" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Ticket Trend (Last 7 Days)</h3>
                            <p className="text-xs text-slate-500">Daily ticket volume</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="tickets"
                                stroke="#1500FF"
                                strokeWidth={3}
                                dot={{ fill: '#1500FF', r: 5 }}
                                activeDot={{ r: 8 }}
                                name="Tickets Created"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-8 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-200 rounded-lg">
                                <Users className="text-slate-700" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Recent Tickets Summary</h3>
                                <p className="text-xs text-slate-500">Top 10 recent entries</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-left text-xs font-extrabold text-slate-600 uppercase tracking-wider">ID</th>
                                    <th className="p-4 text-left text-xs font-extrabold text-slate-600 uppercase tracking-wider">Product</th>
                                    <th className="p-4 text-left text-xs font-extrabold text-slate-600 uppercase tracking-wider">Subject</th>
                                    <th className="p-4 text-left text-xs font-extrabold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-left text-xs font-extrabold text-slate-600 uppercase tracking-wider">Priority</th>
                                    <th className="p-4 text-left text-xs font-extrabold text-slate-600 uppercase tracking-wider">Response</th>
                                    <th className="p-4 text-left text-xs font-extrabold text-slate-600 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.slice(0, 10).map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <span className="font-bold text-slate-700 text-sm">{ticket.id}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-block px-2 py-1 rounded-lg text-xs font-bold uppercase bg-slate-100 text-slate-600">
                                                {ticket.product}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-800 text-sm">{ticket.subject}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{ticket.customer}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                ticket.status === 'critical' ? 'bg-rose-100 text-rose-700' :
                                                    ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {ticket.status === 'resolved' && <CheckCircle2 size={12} />}
                                                {ticket.status === 'critical' && <AlertCircle size={12} />}
                                                {ticket.status === 'in_progress' && <Clock size={12} />}
                                                {ticket.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {ticket.priority.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-semibold text-slate-600">{ticket.responseTime}h</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-slate-600">{ticket.date}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
