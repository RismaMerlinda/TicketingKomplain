"use client";

import Header from "@/app/components/Header";
import { useState, useEffect } from "react";
import { Package, Plus, Search, MoreHorizontal, ArrowRight, Settings, Users, Key, Mail, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MOCK_PRODUCTS, ProductData } from "@/lib/data";
import { ROLES } from "@/lib/auth";
import { useAuth } from "../../context/AuthContext";
import { logActivity } from "@/lib/activity";
import ConfirmModal from "@/app/components/ConfirmModal";
import { getStoredTickets } from "@/lib/tickets";

// Type extension for editable fields if needed, or just use ProductData
interface ProductForm extends ProductData {
    // just using ProductData for now
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Record<string, ProductData>>(MOCK_PRODUCTS);
    const [tickets, setTickets] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);

    // Form State for Add/Edit
    const [formData, setFormData] = useState<Partial<ProductData>>({});

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string | null }>({
        isOpen: false,
        productId: null
    });
    const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; title: string }>({
        isOpen: false,
        message: "",
        title: "Validation Error"
    });

    useEffect(() => {
        // Fetch products from backend API
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://127.0.0.1:5900/api/products');
                const contentType = res.headers.get("content-type");
                if (res.ok && contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    const productCount = Object.keys(data).length;

                    // If API is empty, check localStorage and migrate
                    if (productCount === 0) {
                        const stored = localStorage.getItem('products');
                        if (stored) {
                            const localProducts = JSON.parse(stored);
                            console.log('📦 Migrating products from localStorage to MongoDB...');

                            // Migrate each product to MongoDB
                            for (const [id, product] of Object.entries(localProducts)) {
                                try {
                                    await fetch('http://127.0.0.1:5900/api/products', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(product)
                                    });
                                } catch (err) {
                                    console.error('Failed to migrate product:', id, err);
                                }
                            }

                            // Set local state immediately
                            setProducts(localProducts);
                            return;
                        }
                    }

                    setProducts(data);
                } else {
                    console.error("Failed to fetch products from API");
                    // Fallback to localStorage
                    const stored = localStorage.getItem('products');
                    if (stored) {
                        setProducts(JSON.parse(stored));
                    }
                }
            } catch (e) {
                console.error("API Connection Error", e);
                // Fallback to localStorage
                const stored = localStorage.getItem('products');
                if (stored) {
                    setProducts(JSON.parse(stored));
                }
            }
        };

        fetchProducts();

        // Load tickets for dynamic stats

        const loadTickets = async () => {
            const t = await getStoredTickets();
            setTickets(t);
        };
        loadTickets();
        window.addEventListener('ticketsUpdated', loadTickets);
        return () => window.removeEventListener('ticketsUpdated', loadTickets);
    }, []);

    const { user } = useAuth();

    const filteredProducts = Object.values(products).filter(p => {
        // Role based filtering
        if (user?.role === ROLES.PRODUCT_ADMIN && user?.productId) {
            if (p.id !== user.productId) return false;
        }

        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    const handleAddClick = () => {
        setFormData({
            id: "",
            name: "",
            description: "",
            adminEmail: "",
            adminPassword: "",
            stats: { total: 0, active: 0, resolved: 0, satisfaction: 5.0 },
            trend: [],
            dist: [],
            activity: []
        });
        setIsAddModalOpen(true);
    };

    const handleEditClick = (product: ProductData) => {
        setSelectedProduct(product);
        setFormData({
            ...product
        });
        setIsEditModalOpen(true);
    };

    const handleSaveProduct = async () => {
        if (!formData.id || !formData.name || !formData.adminEmail || !formData.adminPassword) {
            setAlertModal({
                isOpen: true,
                title: "Data Tidak Lengkap",
                message: "Harap isi semua kolom wajib: ID Produk, Nama Produk, Email Admin, dan Password Admin."
            });
            return;
        }

        const newProductId = formData.id.toLowerCase().replace(/\s+/g, '-');
        const newProduct: ProductData = {
            ...formData as ProductData,
            id: newProductId,
            // Ensure these exist if not provided
            stats: formData.stats || { total: 0, active: 0, resolved: 0, satisfaction: 5.0 },
            trend: formData.trend || [],
            dist: formData.dist || [],
            activity: formData.activity || []
        };

        try {
            const method = isEditModalOpen ? 'PUT' : 'POST';
            const url = isEditModalOpen
                ? `http://127.0.0.1:5900/api/products/${newProductId}`
                : 'http://127.0.0.1:5900/api/products';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to save product');
            }

            // Update Local State from Response or manually
            setProducts(prev => ({ ...prev, [newProductId]: newProduct }));

            // Sync Admin (Local Storage for now, ideally also backend)
            if (formData.adminEmail && formData.adminPassword) {
                const storedUsersStr = localStorage.getItem('ticketing_users');
                let users = storedUsersStr ? JSON.parse(storedUsersStr) : [];
                users = users.filter((u: any) => u.productId !== newProductId && u.email !== formData.adminEmail);
                const newUser = {
                    email: formData.adminEmail,
                    password: formData.adminPassword,
                    name: `Admin ${formData.name}`,
                    role: ROLES.PRODUCT_ADMIN,
                    productId: newProductId
                };
                users.push(newUser);
                localStorage.setItem('ticketing_users', JSON.stringify(users));
            }

            // Log Activity
            logActivity(
                isEditModalOpen ? `Updated product: ${newProduct.name}` : `Created new product: ${newProduct.name}`,
                user?.name || "Super Admin",
                newProductId
            );

            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setFormData({});

        } catch (error: any) {
            console.error("Save Error:", error);
            setAlertModal({
                isOpen: true,
                title: "Error Saving Product",
                message: error.message || "Could not save product to database."
            });
        }
    };

    const handleDeleteProduct = async (id: string) => {
        const productName = products[id]?.name || id;

        try {
            const res = await fetch(`http://127.0.0.1:5900/api/products/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error("Failed to delete product");
            }

            // Update UI State
            setProducts(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });

            // Log Activity
            logActivity(
                `Deleted product: ${productName}`,
                user?.name || "Super Admin",
                id
            );

            setIsEditModalOpen(false);
            setDeleteModal({ isOpen: false, productId: null });

        } catch (error: any) {
            console.error("Delete Error:", error);
            setAlertModal({
                isOpen: true,
                title: "Error Deleting Product",
                message: error.message || "Could not delete product."
            });
        }
    };

    return (
        <div className="min-h-screen pb-12 bg-[#F8FAFC]">
            <Header title="Products" subtitle="Manage Software Products & Access" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1600px] mx-auto px-4 md:px-8 pt-8 space-y-8"
            >
                {/* Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1500FF] transition-colors duration-300" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1500FF]/10 focus:border-[#1500FF] transition-all duration-300 text-slate-800 placeholder:text-slate-400 shadow-sm hover:shadow-md"
                        />
                    </div>
                    {user?.role === ROLES.SUPER_ADMIN && (
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(21 0 255 / 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddClick}
                            className="flex items-center gap-2 bg-[#1500FF] hover:bg-[#1500FF]/90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20"
                        >
                            <Plus size={20} strokeWidth={3} />
                            Add New Product
                        </motion.button>
                    )}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group flex flex-col relative overflow-hidden"
                            >
                                {/* Decorative Gradient Blob */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500" />

                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <motion.div
                                        whileHover={{ rotate: 10, scale: 1.1 }}
                                        className="w-14 h-14 bg-white rounded-2xl text-slate-400 flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm group-hover:border-blue-100 group-hover:shadow-blue-200 transition-all duration-300"
                                    >
                                        {product.icon ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={product.icon} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={28} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        )}
                                    </motion.div>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ rotate: 90, color: "#1500FF", backgroundColor: "#eff6ff" }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleEditClick(product)}
                                            className="p-2 text-slate-300 rounded-xl transition-colors"
                                            title="Manage Access"
                                        >
                                            <Settings size={20} />
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="flex-1 relative z-10">
                                    <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-[#1500FF] transition-colors">{product.name}</h3>
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-6 h-10">{product.description || "No description provided."}</p>

                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        {(() => {
                                            const pTickets = tickets.filter(t => {
                                                if (!t.product) return false;
                                                const tProd = t.product.toLowerCase().trim();
                                                const pName = product.name.toLowerCase().trim();
                                                const pId = product.id.toLowerCase().trim();

                                                // Check for exact name match
                                                if (tProd === pName) return true;

                                                // Check for exact ID match
                                                if (tProd === pId) return true;

                                                // Check for partial ID match (e.g. "003-catatmak" should match "catatmak")
                                                if (tProd.includes(pId) || pId.includes(tProd)) return true;

                                                return false;
                                            });
                                            const pTotal = pTickets.length;
                                            const pActive = pTickets.filter(t => ['New', 'In Progress', 'Pending', 'Overdue'].includes(t.status)).length;
                                            return (
                                                <>
                                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-colors">
                                                        <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-wider">Tickets</p>
                                                        <p className="font-extrabold text-2xl text-slate-700 group-hover:text-[#1500FF] transition-colors">{pTotal}</p>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-colors">
                                                        <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-wider">Active</p>
                                                        <p className="font-extrabold text-2xl text-slate-700 group-hover:text-[#1500FF] transition-colors">{pActive}</p>
                                                    </div>
                                                </>
                                            )
                                        })()}
                                    </div>
                                </div>

                                <motion.button
                                    onClick={() => router.push(`/dashboard/tickets?product=${product.id}`)}
                                    whileHover="hover"
                                    initial="rest"
                                    animate="rest"
                                    variants={{
                                        rest: { scale: 1, backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#475569" },
                                        hover: { scale: 1.02, backgroundColor: "#1500FF", borderColor: "#1500FF", color: "#ffffff" }
                                    }}
                                    className="w-full flex items-center justify-between px-6 py-3.5 rounded-xl border font-bold transition-all text-sm shadow-sm relative z-10 overflow-hidden group/btn"
                                >
                                    <span className="relative z-10">View Dashboard</span>
                                    <motion.div
                                        variants={{
                                            rest: { x: 0 },
                                            hover: { x: 5 }
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <ArrowRight size={18} className="relative z-10 opacity-70 group-hover/btn:opacity-100" />
                                    </motion.div>
                                </motion.button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add New Placeholder */}
                    {user?.role === ROLES.SUPER_ADMIN && (
                        <motion.div
                            onClick={handleAddClick}
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 246, 255, 0.5)", borderColor: "rgba(21, 0, 255, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            className="cursor-pointer border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 transition-all h-full min-h-[300px] group"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 border-2 border-slate-100 shadow-sm group-hover:border-blue-200 group-hover:shadow-blue-200 transition-all"
                            >
                                <Plus size={40} className="text-slate-300 group-hover:text-[#1500FF] transition-colors" />
                            </motion.div>
                            <p className="font-bold text-lg text-slate-500 group-hover:text-[#1500FF] transition-colors">Add New Product</p>
                            <p className="text-xs text-slate-400 text-center mt-2 max-w-[200px]">Create a new workspace and assign admin access</p>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Modal - Add/Edit */}
            <AnimatePresence>
                {(isAddModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-800">
                                        {isEditModalOpen ? `Manage ${selectedProduct?.name}` : "Add New Product"}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {isEditModalOpen ? "Update product details and admin credentials" : "Create a new product in the system"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                    className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Product ID <span className="text-rose-500">*</span></label>
                                        <input
                                            disabled={isEditModalOpen}
                                            type="text"
                                            value={formData.id || ""}
                                            onChange={e => setFormData({ ...formData, id: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] font-bold text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                                            placeholder="e.g. orbit-billiard"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Product Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.name || ""}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] text-slate-800 font-semibold"
                                            placeholder="e.g. Orbit Billiard System"
                                        />
                                    </div>

                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Product Logo</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 relative group">
                                                {formData.icon ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={formData.icon} alt="Logo Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="text-slate-300" size={24} />
                                                )}
                                                {formData.icon && (
                                                    <button
                                                        onClick={() => setFormData({ ...formData, icon: undefined })}
                                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <label className="flex-1 cursor-pointer">
                                                <div className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1500FF] transition-colors flex items-center justify-center gap-2">
                                                    <Plus size={16} />
                                                    Upload Logo
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setFormData({ ...formData, icon: reader.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Description</label>
                                        <textarea
                                            value={formData.description || ""}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] text-slate-800"
                                            placeholder="Brief description of the product..."
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                                        <Key size={18} className="text-[#1500FF]" />
                                        Admin Credentials (Generates Admin Account)
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Admin Email <span className="text-rose-500">*</span></label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="email"
                                                    value={formData.adminEmail || ""}
                                                    onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] text-slate-800 font-medium"
                                                    placeholder="admin@product.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Admin Password <span className="text-rose-500">*</span></label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.adminPassword || ""}
                                                    onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] text-slate-800 font-medium"
                                                    placeholder="Set password"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                {isEditModalOpen && (
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, productId: selectedProduct!.id })}
                                        className="mr-auto text-rose-500 text-sm font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-slate-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProduct}
                                    className="px-6 py-2.5 rounded-xl bg-[#1500FF] text-white font-bold hover:bg-[#1500FF]/90 shadow-lg shadow-[#1500FF]/20 transition-all flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, productId: null })}
                onConfirm={() => deleteModal.productId && handleDeleteProduct(deleteModal.productId)}
                title="Delete Product"
                message={`Are you sure you want to delete this product? All dashboard data, activities, and linked admin access will be permanently removed.`}
            />

            <ConfirmModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                onConfirm={() => setAlertModal({ ...alertModal, isOpen: false })}
                title={alertModal.title}
                message={alertModal.message}
                confirmText="Understood"
                variant="info"
            />
        </div >
    );
}
