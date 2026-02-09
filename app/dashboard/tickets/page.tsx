"use client";

import React, { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import {
    Search,
    Filter,
    MessageCircle,
    Globe,
    Mail,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Ticket as TicketIcon,
    Plus,
    X,
    User,
    Trash2,
    Calendar,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    LayoutGrid,
    AlignJustify,
    Table as TableIcon,
    MoreHorizontal,
    Info,
    Instagram,
    Facebook,
    Twitter,
    Smartphone,
    ClipboardList,
    HelpCircle,
    Edit3,
    Check,
    Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "@/lib/auth";
import { MOCK_PRODUCTS } from "@/lib/data";
import ConfirmModal from "@/app/components/ConfirmModal";
import { logActivity } from "@/lib/activity";
import { getStoredTickets, addTicket, updateTicket, deleteTicket, TicketData, MOCK_TICKETS } from "@/lib/tickets";

// --- Types ---
type TicketStatus = "New" | "In Progress" | "Pending" | "Overdue" | "Done" | "Closed" | "Resolved";
type TicketPriority = "High" | "Medium" | "Low";
type TicketSource = "WhatsApp" | "Instagram" | "Facebook" | "X" | "Website" | "Email" | "App / In-App" | "Offline / Manual" | "Other";
type ViewMode = "GRID" | "LIST" | "TABLE";

// --- Helpers ---

const getStatusStyles = (status: TicketStatus) => {
    switch (status) {
        case "New": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: AlertCircle, accent: "bg-blue-500" };
        case "In Progress": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: Clock, accent: "bg-amber-500" };
        case "Pending": return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", icon: MoreHorizontal, accent: "bg-slate-400" };
        case "Overdue": return { bg: "bg-slate-900", text: "text-white", border: "border-slate-800", icon: AlertCircle, accent: "bg-black" };
        case "Done": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: CheckCircle2, accent: "bg-emerald-500" };
        case "Resolved": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: CheckCircle2, accent: "bg-emerald-500" };
        case "Closed": return { bg: "bg-[#EFEBE9]", text: "text-[#4E342E]", border: "border-[#D7CCC8]", icon: XCircle, accent: "bg-[#3E2723]" };
        default: return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100", icon: Info, accent: "bg-slate-400" };
    }
};

const getSourceIcon = (source: TicketSource) => {
    switch (source) {
        case "WhatsApp": return <MessageCircle size={14} className="text-green-500" />;
        case "Instagram": return <Instagram size={14} className="text-pink-500" />;
        case "Facebook": return <Facebook size={14} className="text-blue-600" />;
        case "X": return <Twitter size={14} className="text-slate-900" />;
        case "Website": return <Globe size={14} className="text-blue-400" />;
        case "Email": return <Mail size={14} className="text-orange-500" />;
        case "App / In-App": return <Smartphone size={14} className="text-purple-500" />;
        case "Offline / Manual": return <ClipboardList size={14} className="text-slate-500" />;
        case "Other": return <HelpCircle size={14} className="text-slate-400" />;
        default: return <Globe size={14} className="text-slate-400" />;
    }
};

const getProductStyles = (product: string) => {
    const name = product.toLowerCase();
    if (name.includes("joki")) {
        return { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" };
    } else if (name.includes("catatmak")) {
        return { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" };
    } else if (name.includes("orbit")) {
        return { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" };
    }
    return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" };
};

// --- View Components ---

const TicketCard = ({ ticket, onClick }: { ticket: TicketData, onClick: () => void }) => {
    const styles = getStatusStyles(ticket.status);
    const productStyles = getProductStyles(ticket.product);
    const StatusIcon = styles.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -10 }}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white rounded-2xl border border-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:border-[#1500FF]/30 overflow-hidden cursor-pointer flex flex-col h-full transition-all duration-300"
            onClick={onClick}
        >
            <div className={`absolute top-0 left-0 right-0 h-1 ${styles.accent} ${ticket.status === 'Overdue' ? 'animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.5)]' : ''}`} />
            <div className="p-5 pb-3 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-400">{ticket.code}</span>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${styles.bg} ${styles.text} border ${styles.border}`}>
                            <StatusIcon size={10} strokeWidth={3} />
                            {ticket.status}
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-base leading-tight line-clamp-2 transition-colors">
                        {ticket.title}
                    </h3>
                </div>
            </div>
            <div className="px-5 py-2 flex-1 space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${productStyles.text} ${productStyles.bg} px-2.5 py-1 rounded-lg border ${productStyles.border} whitespace-nowrap`}>{ticket.product}</span>
                    <div className="flex items-center gap-1.5 text-slate-500 font-normal">
                        {getSourceIcon(ticket.source)}
                        <span>{ticket.source}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {ticket.customer.charAt(0)}
                    </div>
                    <span className="font-normal truncate">{ticket.customer}</span>
                </div>
            </div>
            <div className="px-5 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 group/priority relative">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${ticket.priority === 'High' ? 'text-rose-600' : 'text-slate-500'}`}>
                        Priority: {ticket.priority}
                    </span>
                    {ticket.priority === 'High' && (
                        <>
                            <Info size={12} className="text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] leading-relaxed rounded-lg shadow-xl opacity-0 group-hover/priority:opacity-100 transition-opacity pointer-events-none z-10">
                                <strong className="block mb-0.5 text-rose-300">High Priority Ticket</strong>
                                Critical issue affecting system, data, finance, or many users. Requires immediate handling.
                                <div className="absolute bottom-[-4px] left-3 w-2 h-2 bg-slate-800 rotate-45"></div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="mt-1 mx-5 mb-5 grid grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-slate-50/50 p-2.5 flex flex-col items-center justify-center text-center transition-colors">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Response</span>
                    <span className="text-xs font-bold text-slate-700">{ticket.responseDue}</span>
                </div>
                <div className="bg-slate-50/50 p-2.5 flex flex-col items-center justify-center text-center transition-colors">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Resolve</span>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-700">{ticket.resolveDue}</span>
                        {(ticket.priority === 'High' || ticket.status === 'In Progress' || ticket.status === 'Pending' || ticket.status === 'New') && ticket.status !== 'Done' && ticket.status !== 'Closed' && ticket.status !== 'Overdue' && (
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ticket.status === 'In Progress' ? 'bg-amber-400' :
                                    ticket.status === 'Pending' ? 'bg-slate-300' :
                                        ticket.status === 'New' ? (ticket.priority === 'High' ? 'bg-rose-400' : 'bg-[#1500FF]/50') : 'bg-rose-400'
                                    }`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${ticket.status === 'In Progress' ? 'bg-amber-500' :
                                    ticket.status === 'Pending' ? 'bg-slate-400' :
                                        ticket.status === 'New' ? (ticket.priority === 'High' ? 'bg-rose-500' : 'bg-[#1500FF]') : 'bg-rose-500'
                                    }`}></span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const TicketListItem = ({ ticket, onClick }: { ticket: TicketData, onClick: () => void }) => {
    const styles = getStatusStyles(ticket.status);
    const productStyles = getProductStyles(ticket.product);
    const StatusIcon = styles.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ x: 10 }}
            className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden cursor-pointer transition-all"
            onClick={onClick}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.accent}`} />
            <div className="p-5 flex flex-col md:flex-row gap-6 md:items-center">
                <div className="flex flex-col gap-2 min-w-[140px]">
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-[#1500FF] transition-colors">{ticket.code}</span>
                    <div className={`w-fit px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${styles.bg} ${styles.text} border ${styles.border}`}>
                        <StatusIcon size={12} strokeWidth={3} />
                        {ticket.status}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-base leading-tight mb-2 truncate group-hover:text-[#1500FF] transition-colors">{ticket.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 text-nowrap overflow-hidden">
                        <span className={`font-medium ${productStyles.text} ${productStyles.bg} px-2 py-0.5 rounded border ${productStyles.border}`}>{ticket.product}</span>
                        <div className="flex items-center gap-1.5 font-normal"><User size={12} /> {ticket.customer}</div>
                        <div className="flex items-center gap-1.5 font-normal">{getSourceIcon(ticket.source)} {ticket.source}</div>
                    </div>
                </div>
                <div className="flex items-center gap-6 justify-between md:justify-end min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    <div className="flex flex-col gap-1 text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Due</span>
                        <div className="flex items-center justify-end gap-1.5">
                            <Clock size={12} className={ticket.status === 'Overdue' ? 'text-rose-500' : 'text-slate-400'} />
                            <span className={`text-xs font-bold font-mono ${ticket.status === 'Overdue' ? 'text-rose-600' : 'text-slate-700'}`}>{ticket.resolveDue}</span>
                            {(ticket.priority === 'High' || ticket.status === 'In Progress' || ticket.status === 'Pending' || ticket.status === 'New') && ticket.status !== 'Done' && ticket.status !== 'Closed' && ticket.status !== 'Overdue' && (
                                <span className="relative flex h-2 w-2 ml-1">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ticket.status === 'In Progress' ? 'bg-amber-400' :
                                        ticket.status === 'Pending' ? 'bg-slate-300' :
                                            ticket.status === 'New' ? (ticket.priority === 'High' ? 'bg-rose-400' : 'bg-[#1500FF]/50') : 'bg-rose-400'
                                        }`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${ticket.status === 'In Progress' ? 'bg-amber-500' :
                                        ticket.status === 'Pending' ? 'bg-slate-400' :
                                            ticket.status === 'New' ? (ticket.priority === 'High' ? 'bg-rose-500' : 'bg-[#1500FF]') : 'bg-rose-500'
                                        }`}></span>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#1500FF] group-hover:text-white transition-all"><ChevronRight size={18} /></div>
                </div>
            </div>
        </motion.div>
    );
};

const TicketTableRow = ({ ticket, onClick }: { ticket: TicketData, onClick: () => void }) => {
    const styles = getStatusStyles(ticket.status);
    const productStyles = getProductStyles(ticket.product);
    const StatusIcon = styles.icon;

    return (
        <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={onClick}>
            <td className="p-4 font-mono text-xs font-bold text-slate-500 group-hover:text-[#1500FF]">{ticket.code}</td>
            <td className="p-4">
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{ticket.title}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-2">
                        {getSourceIcon(ticket.source)} {ticket.source}
                    </span>
                </div>
            </td>
            <td className="p-4">
                <div className={`w-fit px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${styles.bg} ${styles.text} border ${styles.border}`}>
                    <StatusIcon size={10} strokeWidth={3} />
                    {ticket.status}
                </div>
            </td>
            <td className="p-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${productStyles.bg} ${productStyles.text} border ${productStyles.border} uppercase tracking-tight`}>
                    {ticket.product}
                </span>
            </td>
            <td className="p-4 text-sm font-normal text-slate-600">{ticket.customer}</td>
            <td className={`p-4 text-xs font-bold font-mono ${ticket.status === 'Overdue' ? 'text-rose-600' : 'text-slate-500'}`}>
                <div className="flex items-center gap-2 font-mono">
                    {ticket.resolveDue}
                    {(ticket.priority === 'High' || ticket.status === 'In Progress' || ticket.status === 'Pending' || ticket.status === 'New') && ticket.status !== 'Done' && ticket.status !== 'Closed' && ticket.status !== 'Overdue' && (
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ticket.status === 'In Progress' ? 'bg-amber-400' :
                                ticket.status === 'Pending' ? 'bg-slate-300' :
                                    ticket.status === 'New' ? (ticket.priority === 'High' ? 'bg-rose-400' : 'bg-[#1500FF]/50') : 'bg-rose-400'
                                }`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${ticket.status === 'In Progress' ? 'bg-amber-500' :
                                ticket.status === 'Pending' ? 'bg-slate-400' :
                                    ticket.status === 'New' ? (ticket.priority === 'High' ? 'bg-rose-500' : 'bg-[#1500FF]') : 'bg-rose-500'
                                }`}></span>
                        </span>
                    )}
                </div>
            </td>
            <td className="p-4 text-right">
                <button className="p-2 text-slate-400 hover:text-[#1500FF] hover:bg-[#1500FF]/5 rounded-lg transition-all"><ChevronRight size={16} /></button>
            </td>
        </tr>
    );
};

const FilterTab = ({ label, count, isActive, onClick }: { label: string, count?: number, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`
            px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border
            flex items-center gap-2 whitespace-nowrap active:scale-95
            ${isActive
                ? "bg-[#1500FF] border-[#1500FF] text-white scale-105 relative z-10"
                : "bg-white border-slate-200 text-slate-500 hover:border-[#1500FF]/30 hover:text-[#1500FF] hover:bg-slate-50 hover:shadow-sm"
            }
        `}
    >
        {label}
        {count !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {count}
            </span>
        )}
    </button>
);

const ViewToggle = ({ mode, current, onClick }: { mode: ViewMode, current: ViewMode, onClick: (m: ViewMode) => void }) => {
    // Map icons safely
    const icons = {
        "GRID": LayoutGrid,
        "LIST": AlignJustify,
        "TABLE": TableIcon
    };
    const Icon = icons[mode] || LayoutGrid;

    return (
        <button
            onClick={() => onClick(mode)}
            className={`p-2.5 rounded-xl border transition-all active:scale-90 ${mode === current ? 'bg-[#1500FF] border-[#1500FF] text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:text-[#1500FF] hover:border-[#1500FF]/30 hover:shadow-sm'}`}
        >
            <Icon size={18} />
        </button>
    );
}

const DateTimeField = ({ label, value, type, onChange, onAdjust }: { label: string, value: string, type: string, onChange: (v: string) => void, onAdjust: (dir: number) => void }) => (
    <div className="space-y-1 flex-1 relative group">
        <label className="text-[10px] font-bold uppercase text-slate-500">{label}</label>
        <div className="relative">
            <input
                type={type}
                className="w-full p-3 pr-10 rounded-xl border-2 border-blue-50 focus:ring-4 focus:ring-[#1500FF]/10 focus:border-[#1500FF] outline-none font-semibold text-slate-800 bg-white transition-all shadow-sm text-sm"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                <button type="button" onClick={() => onAdjust(1)} className="p-0.5 hover:bg-slate-100 rounded text-slate-900 transition-colors"><ChevronUp size={14} /></button>
                <button type="button" onClick={() => onAdjust(-1)} className="p-0.5 hover:bg-slate-100 rounded text-slate-900 transition-colors"><ChevronDown size={14} /></button>
            </div>
        </div>
    </div>
);

export default function TicketsPage() {
    // const router = useRouter(); // Use the one from imports if needed, or re-enable
    const searchParams = useSearchParams();
    const initialProductFilter = searchParams.get('product');

    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [products, setProducts] = useState<Record<string, any>>(MOCK_PRODUCTS);
    const [activeTab, setActiveTab] = useState<TicketStatus | "All">("All");
    const [productFilter, setProductFilter] = useState<string | null>(initialProductFilter);
    const [direction, setDirection] = useState(0);
    const tabOrder: (TicketStatus | "All")[] = ["All", "New", "In Progress", "Pending", "Overdue", "Done", "Closed"];

    const handleTabChange = (status: TicketStatus | "All") => {
        const prevIndex = tabOrder.indexOf(activeTab);
        const newIndex = tabOrder.indexOf(status);
        setDirection(newIndex > prevIndex ? 1 : -1);
        setActiveTab(status);
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("GRID");

    useEffect(() => {
        const loadTickets = async () => {
            const stored = await getStoredTickets();
            setTickets(stored);
        };

        const loadProducts = () => {
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
                try {
                    setProducts(prev => ({ ...prev, ...JSON.parse(storedProducts) }));
                } catch (e) { console.error("Failed to load products", e); }
            }
        };

        loadTickets();
        loadProducts();
        window.addEventListener('ticketsUpdated', loadTickets);
        return () => {
            window.removeEventListener('ticketsUpdated', loadTickets);
        };
    }, []);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ticketId: string | null }>({
        isOpen: false,
        ticketId: null
    });
    const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({
        isOpen: false,
        message: ""
    });

    // Form State
    const [newTicket, setNewTicket] = useState<Partial<TicketData>>({
        priority: "Medium",
        source: "WhatsApp",
        product: "Catatmak",
        status: "New",
        title: "",
        description: "",
        customer: ""
    });
    // Deadline / Schedule State
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("");

    const { user } = useAuth();

    // Detail Edit State
    const [isEditingDetail, setIsEditingDetail] = useState(false);
    const [editedDescription, setEditedDescription] = useState("");
    const [editedSolution, setEditedSolution] = useState("");
    // searchParams already defined above as `searchParams`
    // using initialProductFilter (derived from searchParams.get('product') at top of function) 
    const productParam = initialProductFilter;

    const roleFilteredTickets = tickets.filter(ticket => {
        // 1. If Product Admin, restrict strict to their product
        if (user?.role === ROLES.PRODUCT_ADMIN && user?.productId) {
            const productInfo = products[user.productId as keyof typeof products];
            if (productInfo) {
                const tProd = ticket.product.toLowerCase().trim();
                const pName = productInfo.name.toLowerCase().trim();
                const pId = productInfo.id.toLowerCase().trim();

                // Robust match: name, ID, or partial ID match
                const isMatch = tProd === pName || tProd === pId || tProd.includes(pId) || pId.includes(tProd);
                if (!isMatch) return false;
            } else {
                // Fallback if product info missing but ID matches
                if (!ticket.product.toLowerCase().includes(user.productId.toLowerCase())) return false;
            }
        }

        // 2. If Super Admin (or others) has ?product=XXX in URL, filter by that
        if (productParam && user?.role === ROLES.SUPER_ADMIN) {
            const tProd = ticket.product.toLowerCase().trim();
            const pParam = productParam.toLowerCase().trim();

            // Try to find product name from param ID if possible
            const productInfo = products[pParam];
            const pName = productInfo ? productInfo.name.toLowerCase().trim() : "";

            // Match against ID or Name
            const isMatch = tProd === pParam || tProd === pName || tProd.includes(pParam) || (pName && tProd.includes(pName));
            if (!isMatch) return false;
        }

        return true;
    });

    const filteredTickets = roleFilteredTickets.filter(ticket => {
        const matchesTab = activeTab === "All" || ticket.status === activeTab;
        const matchesSearch =
            ticket.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.customer.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesProduct = !productFilter || (() => {
            const tProd = ticket.product.toLowerCase().trim();
            const filter = productFilter.toLowerCase().trim();

            // Try to resolve the filter to a known product
            const matchedProduct = Object.values(products).find(p =>
                p.id.toLowerCase() === filter || p.name.toLowerCase() === filter
            );

            if (matchedProduct) {
                const pId = matchedProduct.id.toLowerCase();
                const pName = matchedProduct.name.toLowerCase();
                // Check against both ID and Name of the resolved product, including partial matches
                return tProd === pName || tProd === pId || tProd.includes(pId) || pId.includes(tProd);
            }

            // Fallback: direct string fuzzy match
            return tProd === filter || tProd.includes(filter) || filter.includes(tProd);
        })();

        return matchesTab && matchesSearch && matchesProduct;
    });

    const clearProductFilter = () => {
        setProductFilter(null);
    };

    const handleAddTicket = async () => {
        // Validation: All fields mandatory
        if (!newTicket.title || !newTicket.customer || !newTicket.description || !newTicket.priority || !newTicket.source || !startDate || !startTime || !endDate || !endTime) {
            setAlertModal({
                isOpen: true,
                message: "Action Denied! Please complete all form fields (Subject, Customer, Priority, Source, Schedule, and Description) before saving."
            });
            return;
        }

        const effectiveProduct = (user?.role === ROLES.PRODUCT_ADMIN && user?.productId)
            ? products[user.productId as keyof typeof products]?.name
            : (newTicket.product || "Catatmak");

        if (!effectiveProduct) {
            setAlertModal({
                isOpen: true,
                message: "Please select a valid product!"
            });
            return;
        }

        const ticket: TicketData = {
            title: newTicket.title!,
            description: newTicket.description!,
            product: effectiveProduct as any,
            source: (newTicket.source as TicketSource) || "WhatsApp",
            priority: (newTicket.priority as TicketPriority) || "Medium",
            customer: newTicket.customer!,
            status: "New",
            code: "", // Generated by backend/lib
            id: "", // Generated by backend/lib
            createdAt: new Date().toISOString(),
            prioritySetAt: new Date().toISOString(),
            responseDue: "2h",
            resolveDue: "24h",
            startDate,
            startTime,
            endDate,
            endTime
        };

        const success = await addTicket(ticket);

        if (success) {
            logActivity(
                `Created new ticket ${newTicket.title}`,
                user?.name || "System",
                (user?.role === ROLES.PRODUCT_ADMIN && user?.productId) ? user.productId : (newTicket.product?.toLowerCase() || "catatmak")
            );

            setIsAddModalOpen(false);
            setNewTicket({ priority: "Medium", source: "WhatsApp", product: "Catatmak", status: "New", title: "", description: "", customer: "" });
            // Reset to empty
            setStartDate(""); setStartTime(""); setEndDate(""); setEndTime("");

            // Refresh tickets
            const updated = await getStoredTickets();
            setTickets(updated);
        } else {
            setAlertModal({ isOpen: true, message: "Failed to save ticket to the database!" });
        }
    };

    const handleStatusChange = async (id: string, newStatus: TicketStatus) => {
        const ticket = tickets.find(t => t.id === id);
        if (ticket) {
            const updated = { ...ticket, status: newStatus };
            const success = await updateTicket(updated);

            if (success) {
                const prodId = Object.keys(products).find(key => products[key].name === ticket.product) || null;
                logActivity(`Ticket ${ticket.code} status changed to ${newStatus}`, user?.name || "System", prodId);
                const latest = await getStoredTickets();
                setTickets(latest);
                if (selectedTicket?.id === id) setSelectedTicket(updated);
            }
        }
    };

    const handleDeleteTicket = async (id: string) => {
        const ticketToDelete = tickets.find(t => t.id === id);
        const success = await deleteTicket(id);

        if (success) {
            setSelectedTicket(null);
            if (ticketToDelete) {
                const prodId = Object.keys(products).find(key => products[key].name === ticketToDelete.product) || null;
                logActivity(`Deleted ticket ${ticketToDelete.code}: ${ticketToDelete.title}`, user?.name || "System", prodId);
            }
            const latest = await getStoredTickets();
            setTickets(latest);
        }
        setDeleteModal({ isOpen: false, ticketId: null });
    };

    const handleUpdateDetail = async () => {
        if (!selectedTicket) return;

        const updated = {
            ...selectedTicket,
            description: editedDescription,
            solution: editedSolution
        };
        const success = await updateTicket(updated);

        if (success) {
            logActivity(`Ticket ${selectedTicket.code} content updated`, user?.name || "System", null);
            const latest = await getStoredTickets();
            setTickets(latest);
            setSelectedTicket(updated);
            setIsEditingDetail(false);
        } else {
            setAlertModal({ isOpen: true, message: "Failed to update ticket details!" });
        }
    };

    const adjustDate = (current: string, days: number, setter: (v: string) => void) => {
        const d = current ? new Date(current) : new Date();
        d.setDate(d.getDate() + days);
        setter(d.toISOString().split('T')[0]);
    };

    const adjustTime = (current: string, mins: number, setter: (v: string) => void) => {
        let [h, m] = (current || "08:00").split(':').map(Number);
        const date = new Date();
        date.setHours(h, m + mins);
        setter(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
    };


    return (
        <div className="min-h-screen pb-12 bg-[#F8FAFC]">
            {/* Header */}
            <Header title="Tickets" subtitle="Manage Support Requests & Complaints" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1600px] mx-auto px-4 md:px-8 pt-6 space-y-1"
            >
                {/* Active Product Filter Banner */}
                {productFilter && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 border border-blue-100 rounded-3xl p-5 flex items-center justify-between mb-4 shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#1500FF] shadow-sm border border-blue-100">
                                <Filter size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#1500FF]/60 mb-0.5">Active Ticket Filter</p>
                                <p className="text-base font-bold text-slate-800">
                                    Showing tickets for <span className="text-[#1500FF] uppercase">{Object.values(products).find(p => p.id === productFilter)?.name || productFilter}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={clearProductFilter}
                            className="bg-white px-6 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all shadow-sm active:scale-95"
                        >
                            Clear Filter
                        </button>
                    </motion.div>
                )}

                {/* 1. Controls Row */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                    <div className="relative w-full md:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1500FF] transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find tickets by ID, title, or customer..."
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1500FF]/10 focus:border-[#1500FF] transition-all text-slate-800 font-medium placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="hidden md:flex bg-white p-1 rounded-2xl border border-slate-200">
                            <ViewToggle mode="GRID" current={viewMode} onClick={setViewMode} />
                            <ViewToggle mode="LIST" current={viewMode} onClick={setViewMode} />
                            <ViewToggle mode="TABLE" current={viewMode} onClick={setViewMode} />
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-[#1500FF] text-white rounded-2xl text-sm font-bold hover:bg-slate-900 transition-all duration-300 whitespace-nowrap active:scale-[0.98]"
                        >
                            <Plus size={20} />
                            Create Ticket
                        </button>
                    </div>
                </div>

                {/* 2. Filters Row - Shifted right for better precision */}
                <div className="flex items-center gap-3 overflow-x-auto pt-2 pb-3 scrollbar-hide pl-8 md:pl-0">
                    <FilterTab label="All Tickets" isActive={activeTab === "All"} onClick={() => handleTabChange("All")} count={roleFilteredTickets.length} />
                    {(["New", "In Progress", "Pending", "Overdue", "Done", "Closed"] as TicketStatus[]).map(s => (
                        <FilterTab key={s} label={s} isActive={activeTab === s} onClick={() => handleTabChange(s)} count={roleFilteredTickets.filter(t => t.status === s).length} />
                    ))}
                </div>

                {/* 3. Ticket Content - Balanced gap */}
                <div className={`relative ${filteredTickets.length === 0 ? 'min-h-0 pt-2 pb-0' : 'min-h-[200px] pt-4 pb-8'}`}>
                    <AnimatePresence initial={false} mode="wait" custom={direction}>
                        <motion.div
                            key={activeTab + viewMode}
                            custom={direction}
                            initial={{ opacity: 0, x: direction * 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -direction * 50 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full"
                        >
                            {/* GRID VIEW */}
                            {viewMode === "GRID" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredTickets.map(ticket => (
                                        <TicketCard key={ticket.id} ticket={ticket} onClick={() => {
                                            setSelectedTicket(ticket);
                                            setEditedDescription(ticket.description || "");
                                            setEditedSolution(ticket.solution || "");
                                            setIsEditingDetail(false);
                                        }} />
                                    ))}
                                </div>
                            )}

                            {/* LIST VIEW */}
                            {viewMode === "LIST" && (
                                <div className="flex flex-col gap-3 max-w-[1200px] mx-auto w-full">
                                    {filteredTickets.map(ticket => (
                                        <TicketListItem key={ticket.id} ticket={ticket} onClick={() => {
                                            setSelectedTicket(ticket);
                                            setEditedDescription(ticket.description || "");
                                            setEditedSolution(ticket.solution || "");
                                            setIsEditingDetail(false);
                                        }} />
                                    ))}
                                </div>
                            )}

                            {/* TABLE VIEW */}
                            {viewMode === "TABLE" && (
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-100/80 border-b border-slate-200">
                                                <tr>
                                                    <th className="p-4 py-5 text-xs font-extrabold uppercase text-slate-700 tracking-wider">ID</th>
                                                    <th className="p-4 py-5 text-xs font-extrabold uppercase text-slate-700 tracking-wider">Subject</th>
                                                    <th className="p-4 py-5 text-xs font-extrabold uppercase text-slate-700 tracking-wider">Status</th>
                                                    <th className="p-4 py-5 text-xs font-extrabold uppercase text-slate-700 tracking-wider">Product</th>
                                                    <th className="p-4 py-5 text-xs font-extrabold uppercase text-slate-700 tracking-wider">Customer</th>
                                                    <th className="p-4 py-5 text-xs font-extrabold uppercase text-slate-700 tracking-wider">Due</th>
                                                    <th className="p-4 py-5 text-xs font-extrabold uppercase text-slate-700 tracking-wider text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredTickets.map(ticket => (
                                                    <TicketTableRow key={ticket.id} ticket={ticket} onClick={() => {
                                                        setSelectedTicket(ticket);
                                                        setEditedDescription(ticket.description || "");
                                                        setEditedSolution(ticket.solution || "");
                                                        setIsEditingDetail(false);
                                                    }} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>



                {/* Empty State */}
                {filteredTickets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200 col-span-full">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Search size={32} className="text-slate-300" /></div>
                        <h3 className="text-lg font-bold text-slate-700">No tickets found</h3>
                        <p className="text-sm mb-6">Try different keywords or filters</p>
                        <button onClick={() => { setActiveTab("All"); setSearchQuery(""); }} className="text-[#1500FF] font-bold text-sm hover:underline">Reset Filters</button>
                    </div>
                )}

            </motion.div>

            {/* ADD MODAL - TicketData form */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                                <h3 className="text-xl font-extrabold text-slate-800">New Ticket</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4 overflow-y-auto">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500">Subject / Title <span className="text-rose-500">*</span></label>
                                    <input type="text" className="w-full p-3 rounded-xl border-2 border-blue-50 bg-white focus:ring-4 focus:ring-[#1500FF]/10 focus:border-[#1500FF] outline-none font-semibold text-slate-800 transition-all" placeholder="e.g. System Error on Login" value={newTicket.title} onChange={e => setNewTicket(prev => ({ ...prev, title: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500">Customer Name <span className="text-rose-500">*</span></label>
                                    <input type="text" className="w-full p-3 rounded-xl border-2 border-blue-50 bg-white focus:ring-4 focus:ring-[#1500FF]/10 focus:border-[#1500FF] outline-none font-semibold text-slate-800 transition-all" placeholder="e.g. John Doe" value={newTicket.customer} onChange={e => setNewTicket(prev => ({ ...prev, customer: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500">Product <span className="text-rose-500">*</span></label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-[#1500FF]/20 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                                            value={user?.role === ROLES.PRODUCT_ADMIN ? products[user.productId as string]?.name : (newTicket.product || "Catatmak")}
                                            disabled={user?.role === ROLES.PRODUCT_ADMIN}
                                            onChange={e => setNewTicket(prev => ({ ...prev, product: e.target.value }))}
                                        >
                                            {Object.values(products).map(p => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500">Priority <span className="text-rose-500">*</span></label>
                                        <select className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-[#1500FF]/20 outline-none" value={newTicket.priority} onChange={e => setNewTicket(prev => ({ ...prev, priority: e.target.value as TicketPriority }))}>
                                            <option>Low</option><option>Medium</option><option>High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500">Channel Source <span className="text-rose-500">*</span></label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-[#1500FF]/20 outline-none cursor-pointer"
                                        value={newTicket.source}
                                        onChange={e => setNewTicket(prev => ({ ...prev, source: e.target.value as TicketSource }))}
                                    >
                                        {(["WhatsApp", "Instagram", "Facebook", "X", "Website", "Email", "App / In-App", "Offline / Manual", "Other"] as TicketSource[]).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Schedule Section */}
                                <div className="p-4 bg-white border-2 border-slate-100 rounded-xl space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-slate-400">Target Schedule</h4>

                                    {/* Start */}
                                    <div className="flex gap-3">
                                        <DateTimeField label="Start Date" type="date" value={startDate} onChange={setStartDate} onAdjust={(d) => adjustDate(startDate, d, setStartDate)} />
                                        <DateTimeField label="Start Time" type="time" value={startTime} onChange={setStartTime} onAdjust={(d) => adjustTime(startTime, d * 30, setStartTime)} />
                                    </div>

                                    {/* End */}
                                    <div className="flex gap-3">
                                        <DateTimeField label="End Date" type="date" value={endDate} onChange={setEndDate} onAdjust={(d) => adjustDate(endDate, d, setEndDate)} />
                                        <DateTimeField label="End Time" type="time" value={endTime} onChange={setEndTime} onAdjust={(d) => adjustTime(endTime, d * 30, setEndTime)} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500">Description <span className="text-rose-500">*</span></label>
                                    <textarea rows={3} className="w-full p-3 rounded-xl border-2 border-blue-50 focus:ring-4 focus:ring-[#1500FF]/10 focus:border-[#1500FF] outline-none text-slate-800 font-medium transition-all" placeholder="Detail of the issue..." value={newTicket.description} onChange={e => setNewTicket(prev => ({ ...prev, description: e.target.value }))} />
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                                <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-95">Cancel</button>
                                <button onClick={handleAddTicket} className="px-6 py-2.5 rounded-xl bg-[#1500FF] text-white font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95">Save Ticket</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DETAIL MODAL - Updated to use TicketData */}
            <AnimatePresence>
                {selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">{selectedTicket.code}</span>
                                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Clock size={12} /> {selectedTicket.createdAt}</span>
                                    </div>
                                    <h2 className="text-xl font-extrabold text-slate-800 leading-tight">{selectedTicket.title}</h2>
                                </div>
                                <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-8 flex-1">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Customer</p><p className="font-medium text-slate-700 flex items-center gap-2"><User size={14} className="text-[#1500FF]" /> {selectedTicket.customer}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Product</p><p className={`font-bold ${getProductStyles(selectedTicket.product).text}`}>{selectedTicket.product}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Source</p><p className="font-medium text-slate-700 flex items-center gap-2">{getSourceIcon(selectedTicket.source)} {selectedTicket.source}</p></div>
                                    <div><p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Priority</p><p className="font-medium text-slate-700">{selectedTicket.priority}</p></div>
                                </div>

                                {/* Editable Description Section */}
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold uppercase text-slate-500">Issue Description</h4>
                                        <button
                                            onClick={() => setIsEditingDetail(!isEditingDetail)}
                                            className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-[#1500FF] hover:border-[#1500FF]/30 transition-all"
                                            title="Edit Description"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                    </div>
                                    {isEditingDetail ? (
                                        <textarea
                                            rows={4}
                                            value={editedDescription}
                                            onChange={(e) => setEditedDescription(e.target.value)}
                                            className="w-full p-4 rounded-xl border-2 border-indigo-100 focus:border-[#1500FF] focus:ring-4 focus:ring-[#1500FF]/10 outline-none text-sm font-medium text-slate-800 transition-all bg-white"
                                            placeholder="Update issue description..."
                                        />
                                    ) : (
                                        <p className="text-slate-700 leading-relaxed text-sm">
                                            {selectedTicket.description || "No detailed description provided for this ticket."}
                                        </p>
                                    )}
                                </div>

                                {/* Solution Section - Editable for Admins */}
                                <div className={`p-6 rounded-2xl border ${selectedTicket.solution || isEditingDetail ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'} group`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold uppercase text-emerald-600 flex items-center gap-2">
                                            <CheckCircle2 size={14} /> Official Solution
                                        </h4>
                                        <button
                                            onClick={() => setIsEditingDetail(!isEditingDetail)}
                                            className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                                            title="Edit Solution"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                    </div>
                                    {isEditingDetail ? (
                                        <textarea
                                            rows={4}
                                            value={editedSolution}
                                            onChange={(e) => setEditedSolution(e.target.value)}
                                            className="w-full p-4 rounded-xl border-2 border-emerald-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-medium text-slate-800 transition-all bg-white"
                                            placeholder="Provide technical solution or response here..."
                                        />
                                    ) : (
                                        <p className={`text-sm leading-relaxed ${selectedTicket.solution ? 'text-slate-700 font-medium' : 'text-slate-400 italic'}`}>
                                            {selectedTicket.solution || "No official solution has been documented yet."}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Update Status</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(["New", "In Progress", "Pending", "Done", "Closed"] as TicketStatus[]).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => handleStatusChange(selectedTicket.id, s)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${selectedTicket.status === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between gap-3">
                                <div>
                                    {!isEditingDetail && (
                                        <button onClick={() => setDeleteModal({ isOpen: true, ticketId: selectedTicket.id })} className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-500 font-bold hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"><Trash2 size={16} /> Delete</button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    {isEditingDetail ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setIsEditingDetail(false);
                                                    setEditedDescription(selectedTicket.description || "");
                                                    setEditedSolution(selectedTicket.solution || "");
                                                }}
                                                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-100 transition-all active:scale-95"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleUpdateDetail}
                                                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                <Save size={16} /> Save Changes
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => setSelectedTicket(null)} className="px-10 py-2.5 rounded-xl bg-[#1500FF] text-white font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95">Done</button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, ticketId: null })}
                onConfirm={() => deleteModal.ticketId && handleDeleteTicket(deleteModal.ticketId)}
                title="Delete Ticket"
                message="This action cannot be undone. All data associated with this ticket will be removed forever."
                confirmText="Yes, Delete Ticket"
            />

            <ConfirmModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                onConfirm={() => setAlertModal({ ...alertModal, isOpen: false })}
                title="Validation Required"
                message={alertModal.message}
                confirmText="Understood"
                variant="info"
            />
        </div>
    );
}
