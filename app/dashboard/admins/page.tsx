"use client";

import Header from "@/app/components/Header";
import { useState, useEffect } from "react";
import { Users, Plus, Search, Mail, Key, X, Save, Shield, MoreHorizontal, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_PRODUCTS } from "@/lib/data";
import { ROLES, getStoredUsers } from "@/lib/auth";

export default function AdminsPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [products, setProducts] = useState<any>(MOCK_PRODUCTS);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null); // If null, we are adding new

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: ROLES.PRODUCT_ADMIN,
        productId: "" // empty string means no product selected
    });

    useEffect(() => {
        // Load Users
        const storedUsers = getStoredUsers();
        setUsers(storedUsers);

        // Load Products (merge Mock + LocalStorage)
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
            try {
                setProducts((prev: any) => ({ ...prev, ...JSON.parse(storedProducts) }));
            } catch (e) {
                console.error("Failed to load products", e);
            }
        }
    }, []);

    const handleSaveUser = () => {
        if (!formData.email || !formData.name || !formData.password) return;

        let newUsers = [...users];

        // Determine Role based on productId
        // If productId is selected, strict role is PRODUCT_ADMIN. 
        // If no productId (and maybe clear super admin check needed?), assume SUPER_ADMIN or just generic admin.
        // For simplicity here: If productId is empty -> SUPER_ADMIN, else PRODUCT_ADMIN.
        const roleToSave = formData.productId ? ROLES.PRODUCT_ADMIN : ROLES.SUPER_ADMIN;

        if (editingUser) {
            // Update existing
            newUsers = newUsers.map(u => u.email === editingUser.email ? {
                ...u,
                name: formData.name,
                password: formData.password, // In real app, separate password reset
                role: roleToSave,
                productId: formData.productId || null
            } : u);
        } else {
            // Add New
            if (newUsers.find(u => u.email === formData.email)) {
                alert("User with this email already exists!");
                return;
            }
            newUsers.push({
                email: formData.email,
                name: formData.name,
                password: formData.password,
                role: roleToSave,
                productId: formData.productId || null
            });
        }

        setUsers(newUsers);
        localStorage.setItem('ticketing_users', JSON.stringify(newUsers));
        closeModal();
    };

    const handleDeleteUser = (email: string) => {
        if (confirm(`Delete user ${email}?`)) {
            const newUsers = users.filter(u => u.email !== email);
            setUsers(newUsers);
            localStorage.setItem('ticketing_users', JSON.stringify(newUsers));
            closeModal();
        }
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", role: ROLES.PRODUCT_ADMIN, productId: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            productId: user.productId || ""
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen pb-12 bg-[#F8FAFC]">
            <Header title="Admins" subtitle="Manage System Administrators & Access" />

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
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-[#1500FF] hover:bg-[#1500FF]/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#1500FF]/25 transition-all text-sm active:scale-95"
                    >
                        <Plus size={20} />
                        Add New Admin
                    </button>
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
                                <div key={user.email} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group">
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg select-none">
                                            {user.name.charAt(0)}
                                        </div>
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-800">
                                        {editingUser ? "Edit User" : "Add New User"}
                                    </h3>
                                    <p className="text-sm text-slate-500">Configure access levels and credentials</p>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] text-slate-800 font-semibold"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                disabled={!!editingUser} // Disable email edit for simplicity or allow it if you handle IDs properly
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] text-slate-800 font-medium disabled:bg-slate-50 disabled:text-slate-400"
                                                placeholder="admin@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] text-slate-800 font-medium"
                                                placeholder="Set new password"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Assigned Product</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <select
                                                value={formData.productId}
                                                onChange={e => setFormData({ ...formData, productId: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1500FF]/20 focus:border-[#1500FF] text-slate-800 font-medium appearance-none bg-white"
                                            >
                                                <option value="">No Product (Super Admin Access)</option>
                                                {Object.values(products).map((prod: any) => (
                                                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-2 ml-1">
                                            * Selecting a product will restrict this user to <b>Product Admin</b> role.
                                            <br />* Leaving empty grants <b>Super Admin</b> privileges.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                {editingUser && (
                                    <button
                                        onClick={() => handleDeleteUser(editingUser.email)}
                                        className="mr-auto text-rose-500 text-sm font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 size={16} /> Delete User
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
                                    Save User
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
