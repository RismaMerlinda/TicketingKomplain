"use client";

import Header from "@/app/components/Header";
import { useState, useEffect } from "react";
import { Users, User, Plus, Search, Mail, Key, X, Save, Shield, MoreHorizontal, Trash2, Camera, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_PRODUCTS } from "@/lib/data";
import { ROLES, getStoredUsers } from "@/lib/auth";
import ConfirmModal from "@/app/components/ConfirmModal";
import { useAuth } from "../../context/AuthContext";
import { logActivity } from "@/lib/activity";

export default function AdminsPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [products, setProducts] = useState<any>({});
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null); // If null, we are adding new
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: "delete" | "error"; data?: any }>({
        isOpen: false,
        type: "delete"
    });

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: ROLES.PRODUCT_ADMIN,
        productId: "", // empty string means no product selected
        avatar: ""
    });

    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Fetch Products using helper
                const { getStoredProducts } = await import('@/lib/products');
                const productsList = await getStoredProducts();

                // Convert to map for easy lookup by ID
                const productsMap: any = {};
                productsList.forEach((p: any) => {
                    productsMap[p.id] = p;
                });
                setProducts(productsMap);

                // 2. Fetch Users
                const userRes = await fetch('http://127.0.0.1:5900/api/users', { cache: 'no-store' });
                const userContentType = userRes.headers.get("content-type");
                if (userRes.ok && userContentType && userContentType.includes("application/json")) {
                    let userData = await userRes.json();

                    // --- AUTO SYNC LOGIC ---
                    const existingEmails = new Set(userData.map((u: any) => u.email));
                    const newAdminsToCreate: any[] = [];

                    // Use the list directly for iteration
                    productsList.forEach((prod: any) => {
                        if (prod.adminEmail && !existingEmails.has(prod.adminEmail)) {
                            // Found a product without an Admin User -> Create queue
                            newAdminsToCreate.push({
                                email: prod.adminEmail,
                                password: prod.adminPassword || 'default123',
                                name: `Admin ${prod.name}`,
                                role: ROLES.PRODUCT_ADMIN,
                                productId: prod.id,
                                avatar: prod.icon || `https://ui-avatars.com/api/?name=${prod.name}&background=random`
                            });
                            // Add to set to prevent duplicates in this loop
                            existingEmails.add(prod.adminEmail);
                        }
                    });

                    // Execute creations if needed
                    if (newAdminsToCreate.length > 0) {
                        console.log(`🔄 Syncing ${newAdminsToCreate.length} missing admins...`);
                        await Promise.all(newAdminsToCreate.map(newUser =>
                            fetch('http://127.0.0.1:5900/api/users', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(newUser)
                            })
                        ));

                        // Refetch users after sync
                        const reFetch = await fetch('http://127.0.0.1:5900/api/users');
                        if (reFetch.ok) {
                            userData = await reFetch.json();
                        }
                    }
                    // -----------------------

                    // Ensure Super Admin exists if DB is completely empty
                    if (userData.length === 0) {
                        const superAdmin = {
                            email: "super@admin.com",
                            password: "password",
                            name: "Super Admin",
                            role: ROLES.SUPER_ADMIN,
                            productId: null
                        };
                        await fetch('http://127.0.0.1:5900/api/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(superAdmin)
                        });
                        userData = [superAdmin];
                    }

                    setUsers(userData);
                }
            } catch (e) {
                console.error("Initialization Error", e);
            }
        };

        initData();
    }, []);

    const handleSaveUser = async () => {
        if (!formData.email || !formData.name || !formData.password) return;

        // Determine Role based on productId
        const roleToSave = formData.productId ? ROLES.PRODUCT_ADMIN : ROLES.SUPER_ADMIN;
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: roleToSave,
            productId: formData.productId || null,
            avatar: formData.avatar
        };

        try {
            if (editingUser) {
                // Update existing (Using editingUser._id from MongoDB if available, or fetch by ID logic)
                // Since our frontend might not have _id yet if fresh from localStorage, be careful.
                const idToUpdate = editingUser._id || editingUser.id || editingUser.email; // Fallback logic

                // For UPDATE, we usually need _id from database. 
                // However, our API delete logic uses findById. 
                // Let's assume editingUser has _id if it came from API.

                const res = await fetch(`http://127.0.0.1:5900/api/users/${editingUser._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Failed to update");
                const updated = await res.json();

                setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
            } else {
                // Add New
                const res = await fetch('http://127.0.0.1:5900/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const err = await res.json();
                    setConfirmModal({
                        isOpen: true,
                        type: "error",
                        data: err.message || "Failed to create user"
                    });
                    return;
                }

                const created = await res.json();
                setUsers(prev => [...prev, created]);
            }

            // Log Activity
            logActivity(
                editingUser ? `Updated administrator: ${payload.name}` : `Added new administrator: ${payload.name}`,
                currentUser?.name || "Super Admin",
                payload.productId || null
            );

            closeModal();

        } catch (error: any) {
            console.error("Save User Error", error);
            setConfirmModal({
                isOpen: true,
                type: "error",
                data: "Operation failed. Check server connection."
            });
        }
    };

    const handleDeleteUser = async (emailOrId: string) => {
        // We might get email or ID. Let's find the user first.
        const userToDelete = users.find(u => u.email === emailOrId || u._id === emailOrId);
        if (!userToDelete) return;

        try {
            const res = await fetch(`http://127.0.0.1:5900/api/users/${userToDelete._id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Failed to delete");

            setUsers(prev => prev.filter(u => u._id !== userToDelete._id));

            // Log Activity
            logActivity(
                `Removed access for admin: ${userToDelete.name}`,
                currentUser?.name || "Super Admin",
                userToDelete.productId || null
            );

            closeModal();
            setConfirmModal({ ...confirmModal, isOpen: false });

        } catch (error) {
            console.error("Delete Error", error);
        }
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", role: ROLES.PRODUCT_ADMIN, productId: "", avatar: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            productId: user.productId || "",
            avatar: user.avatar || ""
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const { user: currentUser } = useAuth();

    const filteredUsers = users.filter(u => {
        // Role based filtering
        if (currentUser?.role === ROLES.PRODUCT_ADMIN && currentUser?.productId) {
            if (u.productId !== currentUser.productId) return false;
        }

        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    return (
        <div className="min-h-screen pb-12 bg-[#F8FAFC]">
            <Header title="Product Admins" subtitle="Manage System Administrators & Access" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1600px] mx-auto px-4 md:px-8 pt-8 space-y-8"
            >
                {/* Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#1500FF] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search admins..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] transition-all text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                    {currentUser?.role === ROLES.SUPER_ADMIN && (
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-[#1500FF] hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 text-sm active:scale-95"
                        >
                            <Plus size={20} />
                            Add New Admin
                        </button>
                    )}
                </div>

                {/* Users List */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-4">Administrator</div>
                        <div className="col-span-3">Role</div>
                        <div className="col-span-3">Assigned Product</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {filteredUsers.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <div key={user._id || user.email || `user-${Math.random()}`} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group">
                                    <div className="col-span-4 flex items-center gap-4">
                                        {user.avatar ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover bg-white ring-2 ring-slate-100 shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg select-none ring-2 ring-slate-100">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-slate-800">{user.name}</p>
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${user.role === ROLES.SUPER_ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {user.role === ROLES.SUPER_ADMIN ? 'Super Admin' : 'Product Admin'}
                                        </span>
                                    </div>
                                    <div className="col-span-3">
                                        {user.productId ? (
                                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <span className="w-2 h-2 rounded-full bg-[#1500FF]"></span>
                                                {products[user.productId]?.name || user.productId}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">Global Access</span>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="p-2 text-slate-400 hover:text-[#1500FF] hover:bg-[#1500FF]/5 rounded-lg transition-all"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400">
                            <Users size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-bold">No admins found matching your search.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto pt-20 pb-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[4px] transition-opacity"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col border border-slate-100 my-auto sm:my-0"
                        >
                            {/* Header Style dari Product Modal */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-800">
                                        {editingUser ? "Edit Administrator" : "Add New Admin"}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium mt-1">
                                        {editingUser ? "Update profile and permissions" : "Create a new administrator account"}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                                <div className="space-y-5">
                                    {/* Profile Photo (Moved to Body like Product Logo) */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 px-1">Profile Photo</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 relative group">
                                                {formData.avatar ? (
                                                    <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-[#1500FF] font-black text-2xl">
                                                        {formData.name ? formData.name.charAt(0).toUpperCase() : <User size={28} />}
                                                    </div>
                                                )}
                                                {formData.avatar && (
                                                    <button
                                                        onClick={() => setFormData({ ...formData, avatar: "" })}
                                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <label className="flex-1 cursor-pointer">
                                                <div className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-200 hover:text-[#1500FF] transition-all flex items-center justify-center gap-2">
                                                    <Plus size={18} />
                                                    Upload Photo
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
                                                                setFormData({ ...formData, avatar: reader.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 px-1">Full Identity Name <span className="text-rose-500">*</span></label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/10 focus:border-[#1500FF] text-slate-800 font-bold placeholder:text-slate-300 transition-all"
                                                placeholder="e.g. John Wick"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 px-1">Email <span className="text-rose-500">*</span></label>
                                                <input
                                                    disabled={!!editingUser}
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/10 focus:border-[#1500FF] text-slate-800 font-bold placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400 transition-all lowercase"
                                                    placeholder="admin@email.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 px-1">Access Key <span className="text-rose-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/10 focus:border-[#1500FF] text-slate-800 font-bold placeholder:text-slate-300 transition-all"
                                                    placeholder="Set password"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 px-1">Product Assignment <span className="text-rose-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    disabled={currentUser?.role === ROLES.PRODUCT_ADMIN}
                                                    value={formData.productId}
                                                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/10 focus:border-[#1500FF] text-slate-800 font-bold appearance-none bg-white cursor-pointer transition-all"
                                                >
                                                    <option value="">Global Super Admin</option>
                                                    {Object.values(products).sort((a: any, b: any) => a.name.localeCompare(b.name)).map((prod: any) => (
                                                        <option key={prod.id} value={prod.id}>{prod.name} Admin</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronDown size={18} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Shield size={18} className="text-[#1500FF]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Authorization Scope</p>
                                                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                                                    {formData.productId ?
                                                        `This user is restricted to manage tickets belonging to ${products[formData.productId]?.name || 'the assigned product'}.` :
                                                        "This user will have full global access to manage all products, tickets, and admins."
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                {editingUser && (
                                    <button
                                        onClick={() => setConfirmModal({ isOpen: true, type: "delete", data: editingUser.email })}
                                        className="mr-auto text-rose-500 text-sm font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Revoke Access
                                    </button>
                                )}
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-slate-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveUser}
                                    className="px-6 py-2.5 rounded-xl bg-[#1500FF] text-white font-bold hover:bg-[#1500FF]/90 shadow-lg shadow-[#1500FF]/20 transition-all flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    {editingUser ? "Save Changes" : "Grant Access"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={() => {
                    if (confirmModal.type === "delete") handleDeleteUser(confirmModal.data);
                }}
                title={confirmModal.type === "delete" ? "Delete Administrator" : "Action Required"}
                message={confirmModal.type === "delete"
                    ? `Are you sure you want to remove access for ${confirmModal.data}? This action is permanent.`
                    : String(confirmModal.data)}
                confirmText={confirmModal.type === "delete" ? "Delete Access" : "Understood"}
                variant={confirmModal.type === "delete" ? "danger" : "info"}
            />
        </div>
    );
}
