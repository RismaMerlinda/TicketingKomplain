import { useState, useMemo } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Header from "@/app/components/Header";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    LayoutGrid,
    Table as TableIcon,
    Download,
    Filter,
    Search,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal,
    Calendar,
    User,
    FileSpreadsheet,
    FileIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ... (existing mock data and interface) ...

// Keep mocked data the same, just showing the imports update above.
// Now implementing the rest of the changes within the component...



// --- Mock Data ---
interface ReportData {
    id: string;
    subject: string;
    product: string; // 'orbit', 'catatmark', 'joki'
    status: 'resolved' | 'pending' | 'in_progress' | 'critical';
    date: string;
    customer: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
}

const MOCK_REPORTS: ReportData[] = [
    { id: "T-1001", subject: "Login Issue on Mobile", product: "orbit", status: "critical", date: "2024-02-01", customer: "Budi Santoso", description: "User cannot login via Android app ver 2.1", priority: "high" },
    { id: "T-1002", subject: "Payment Gateway Timeout", product: "catatmark", status: "resolved", date: "2024-02-02", customer: "Siti Aminah", description: "Midtrans callback failed", priority: "high" },
    { id: "T-1003", subject: "Feature Request: Dark Mode", product: "joki", status: "pending", date: "2024-02-03", customer: "Ahmad Dani", description: "User request for dark theme", priority: "low" },
    { id: "T-1004", subject: "Export PDF Error", product: "orbit", status: "in_progress", date: "2024-02-03", customer: "Cafe Berkah", description: "Report PDF generation returns 500", priority: "medium" },
    { id: "T-1005", subject: "Subscription Status Sync", product: "catatmark", status: "resolved", date: "2024-01-28", customer: "Toko Maju", description: "Premium status not reflecting after payment", priority: "high" },
    { id: "T-1006", subject: "Wrong Assignment Data", product: "joki", status: "critical", date: "2024-02-04", customer: "Mahasiswa X", description: "Data structures assignment details missing", priority: "high" },
    { id: "T-1007", subject: "Reservation Table Glitch", product: "orbit", status: "in_progress", date: "2024-02-04", customer: "Billiard Master", description: "Table 4 shows occupied but is empty", priority: "medium" },
    { id: "T-1008", subject: "UI Misalignment", product: "catatmark", status: "pending", date: "2024-02-01", customer: "User 123", description: "Header misaligned on iPhone SE", priority: "low" },
];

export default function ReportsPage() {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
    const [searchQuery, setSearchQuery] = useState("");
    const [productFilter, setProductFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // --- Filter Logic ---

    // 1. Base Data (Product + Search) - Used for Counts
    const baseData = useMemo(() => {
        if (!user) return [];
        let data = MOCK_REPORTS;

        // Role/Product Filter
        if (user.role === 'PRODUCT_ADMIN' && user.productId) {
            data = data.filter(item => item.product.toLowerCase() === user.productId?.toLowerCase());
        } else if (user.role === 'SUPER_ADMIN' && productFilter !== 'all') {
            data = data.filter(item => item.product.toLowerCase() === productFilter.toLowerCase());
        }

        // Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            data = data.filter(item =>
                item.subject.toLowerCase().includes(lowerQuery) ||
                item.customer.toLowerCase().includes(lowerQuery) ||
                item.id.toLowerCase().includes(lowerQuery)
            );
        }
        return data;
    }, [user, searchQuery, productFilter]);

    // 2. Final Data (Status Filter) - Used for Display
    const displayedData = useMemo(() => {
        return statusFilter === 'all'
            ? baseData
            : baseData.filter(item => item.status === statusFilter);
    }, [baseData, statusFilter]);

    // 3. Compute Counts
    const statusCounts = useMemo(() => {
        const counts = { all: baseData.length, critical: 0, in_progress: 0, resolved: 0, pending: 0 };
        baseData.forEach(item => {
            if (counts[item.status as keyof typeof counts] !== undefined) {
                counts[item.status as keyof typeof counts]++;
            }
        });
        return counts;
    }, [baseData]);

    // --- Download Handlers ---
    const handleDownloadCSV = () => {
        const headers = ["ID", "Product", "Subject", "Status", "Priority", "Customer", "Date", "Description"];
        const csvContent = [
            headers.join(","),
            ...displayedData.map(row => [
                row.id,
                row.product,
                `"${row.subject}"`,
                row.status,
                row.priority,
                `"${row.customer}"`,
                row.date,
                `"${row.description}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `report_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text("Ticketing System Report", 14, 20);

        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
        doc.text(`Total Records: ${displayedData.length}`, 14, 34);

        // Table
        const tableColumn = ["ID", "Product", "Subject", "Status", "Date", "Customer"];
        const tableRows = displayedData.map(ticket => [
            ticket.id,
            ticket.product.toUpperCase(),
            ticket.subject,
            ticket.status.replace('_', ' ').toUpperCase(),
            ticket.date,
            ticket.customer
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [21, 0, 255] }, // Blue header to match theme
            styles: { fontSize: 8 }
        });

        doc.save(`report_export_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // --- Styles helper ---
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'critical': return { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", badge: "bg-rose-100 text-rose-700", icon: AlertCircle, btn: "bg-rose-500 hover:bg-rose-600 shadow-rose-200" };
            case 'in_progress': return { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", icon: Clock, btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-200" };
            case 'resolved': return { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, btn: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" };
            default: return { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", badge: "bg-slate-200 text-slate-600", icon: FileText, btn: "bg-slate-700 hover:bg-slate-800 shadow-slate-200" };
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            <Header title="Reports & Complaints" subtitle="Manage and track system tickets" />

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 space-y-6">



                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm sticky top-24 z-10">

                    {/* Left: Search & View Toggle */}
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search usage, ID, or customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('board')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-white shadow text-[#1500FF]' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow text-[#1500FF]' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <TableIcon size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Right: Filters & Actions */}
                    <div className="flex items-center gap-3">
                        {/* Only Super Admin can switch product context manually (if they want to see specific subset) */}
                        {user?.role === 'SUPER_ADMIN' && (
                            <div className="relative group">
                                <select
                                    value={productFilter}
                                    onChange={(e) => setProductFilter(e.target.value)}
                                    className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl hover:border-[#1500FF]/50 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 cursor-pointer"
                                >
                                    <option value="all">All Products</option>
                                    <option value="orbit">Orbit Billiard</option>
                                    <option value="catatmark">Catatmark</option>
                                    <option value="joki">Joki Informatika</option>
                                </select>
                                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        )}

                        {/* Download Buttons - SUPER ADMIN ONLY */}
                        {user?.role === 'SUPER_ADMIN' && (
                            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                                <button
                                    onClick={handleDownloadCSV}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1500FF] transition-colors"
                                    title="Export as CSV"
                                >
                                    <FileSpreadsheet size={16} />
                                    <span className="hidden xl:inline">CSV</span>
                                </button>
                                <div className="w-px bg-slate-200 my-1 mx-1"></div>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-colors"
                                    title="Export as PDF"
                                >
                                    <FileIcon size={16} />
                                    <span className="hidden xl:inline">PDF</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Status Filters (Moved Below) --- */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    {[
                        { id: 'all', label: 'All Reports', count: statusCounts.all, color: 'bg-white text-slate-600 border-slate-200' },
                        { id: 'critical', label: 'Critical', count: statusCounts.critical, color: 'bg-rose-50 text-rose-700 border-rose-100' },
                        { id: 'in_progress', label: 'In Progress', count: statusCounts.in_progress, color: 'bg-amber-50 text-amber-700 border-amber-100' },
                        { id: 'resolved', label: 'Resolved', count: statusCounts.resolved, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                        { id: 'pending', label: 'Pending', count: statusCounts.pending, color: 'bg-slate-50 text-slate-600 border-slate-200' },
                    ].map((status) => (
                        <button
                            key={status.id}
                            onClick={() => setStatusFilter(status.id)}
                            className={`
                                relative flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-200 group
                                ${statusFilter === status.id
                                    ? `border-[#1500FF] shadow-[0_4px_12px_-2px_rgba(21,0,255,0.15)] scale-105 z-10 bg-white`
                                    : `${status.color} border-transparent hover:border-slate-200 hover:scale-105`
                                }
                            `}
                        >
                            <span className={`text-sm font-bold ${statusFilter === status.id ? 'text-[#1500FF]' : ''}`}>{status.label}</span>
                            <span className={`
                                px-2 py-0.5 rounded-full text-[10px] font-black
                                ${statusFilter === status.id ? 'bg-[#1500FF] text-white' : 'bg-white/50 border border-black/5'}
                            `}>
                                {status.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {displayedData.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300"
                        >
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Search className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No reports found</h3>
                            <p className="text-slate-400 text-sm">Try adjusting your filters or search query.</p>
                        </motion.div>
                    ) : viewMode === 'board' ? (
                        // --- BOARD VIEW ---
                        <motion.div
                            key="board"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {displayedData.map(item => {
                                const style = getStatusStyle(item.status);
                                const StatusIcon = style.icon;

                                return (
                                    <div key={item.id} className={`relative flex flex-col p-6 rounded-3xl border-2 ${style.bg} ${style.border} transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 group`}>

                                        {/* Status Badge */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`px-3 py-1 rounded-full text-[10px] items-center gap-1.5 flex uppercase font-extrabold tracking-wider ${style.badge}`}>
                                                <StatusIcon size={12} />
                                                {item.status.replace('_', ' ')}
                                            </div>
                                            <div className="bg-white/50 p-2 rounded-full cursor-pointer hover:bg-white transition-colors">
                                                <MoreHorizontal size={16} className={`${style.text}`} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 mb-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold text-slate-400">#{item.id}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="text-xs font-bold text-slate-400 uppercase">{item.product}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{item.subject}</h3>
                                            <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                                        </div>

                                        {/* Meta Details */}
                                        <div className="space-y-3 mb-6 bg-white/60 p-4 rounded-2xl">
                                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                                                <Calendar size={14} className="text-slate-400" />
                                                {item.date}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                                                <User size={14} className="text-slate-400" />
                                                {item.customer}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${style.btn}`}>
                                            View Details
                                        </button>
                                    </div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        // --- TABLE VIEW ---
                        <motion.div
                            key="table"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Report ID</th>
                                            <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Subject</th>
                                            {user?.role === 'SUPER_ADMIN' && (
                                                <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Product</th>
                                            )}
                                            <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {displayedData.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="p-5 text-sm font-bold text-slate-600">#{item.id}</td>
                                                <td className="p-5">
                                                    <div className="font-bold text-slate-800">{item.subject}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{item.customer}</div>
                                                </td>
                                                {user?.role === 'SUPER_ADMIN' && (
                                                    <td className="p-5">
                                                        <span className="inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500">
                                                            {item.product}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="p-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${getStatusStyle(item.status).badge}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'critical' ? 'bg-rose-500' : 'bg-current'}`}></span>
                                                        {item.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-sm font-bold text-slate-500">{item.date}</td>
                                                <td className="p-5">
                                                    <button className="text-slate-400 hover:text-[#1500FF] font-bold text-xs transition-colors">
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
