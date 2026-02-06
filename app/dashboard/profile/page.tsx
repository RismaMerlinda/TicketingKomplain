"use client";

import Header from "@/app/components/Header";
import { useAuth } from "@/app/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Shield, Check, Save, Plus, Trash2 } from "lucide-react";
import { logActivity } from "@/lib/activity";

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync local state when user data is loaded from database
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setAvatar(user.avatar || "");
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save to MongoDB via AuthContext
            await updateUser({ name, avatar });

            logActivity("Updated profile information", user?.name || "User", user?.productId);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
                setIsConfirmOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const confirmPhoto = () => {
        if (previewImage) {
            setAvatar(previewImage);
        }
        setIsConfirmOpen(false);
        setPreviewImage(null);
    };

    return (
        <div className="min-h-screen pb-12 bg-[#F8FAFC]">
            <Header title="My Profile" subtitle="Account Identity & Settings" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto px-4 md:px-8 py-10"
            >
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
                    {/* Cover / Top Accent */}
                    <div className="h-32 bg-[#1500FF] relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
                    </div>

                    <div className="px-8 pb-12 relative">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center -mt-16 mb-12">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl relative z-10">
                                    <div className="w-full h-full rounded-[2.2rem] bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-50">
                                        {avatar ? (
                                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-slate-300" />
                                        )}
                                    </div>
                                </div>
                                {avatar && (
                                    <button
                                        onClick={() => setAvatar("")}
                                        className="absolute -bottom-2 -left-2 z-20 w-10 h-10 bg-rose-500 text-white rounded-2xl shadow-xl border-4 border-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                        title="Delete Photo"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 z-20 w-10 h-10 bg-[#1500FF] text-white rounded-2xl shadow-xl border-4 border-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                    title="Upload Photo"
                                >
                                    <Plus size={20} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <h2 className="mt-4 text-2xl font-black text-slate-800 tracking-tight">{user?.name}</h2>
                            <p className="text-xs font-bold text-[#1500FF] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mt-2">
                                {(user?.role || "").replace('_', ' ')}
                            </p>
                        </div>

                        {/* Form Section */}
                        <div className="max-w-xl mx-auto space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Display Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1500FF] transition-colors">
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your Name"
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1500FF]/5 focus:border-[#1500FF] text-slate-800 font-bold transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Email Display (Read only) */}
                                <div className="space-y-2 opacity-60">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            value={user?.email || ""}
                                            readOnly
                                            className="w-full pl-14 pr-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl cursor-not-allowed text-slate-500 font-bold outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Role Info (Read only) */}
                                <div className="space-y-2 opacity-60">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Account Authority</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                            <Shield size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            value={user?.role.replace('_', ' ') || ""}
                                            readOnly
                                            className="w-full pl-14 pr-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl cursor-not-allowed text-slate-500 font-bold outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-8">
                                <button
                                    onClick={() => { setName(user?.name || ""); setAvatar(user?.avatar || ""); }}
                                    className="px-8 py-3.5 bg-rose-50 text-rose-500 font-black rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-[0.95] flex items-center justify-center shadow-sm"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-10 py-3.5 bg-[#1500FF] hover:bg-slate-900 text-white font-black rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg shadow-blue-900/10"
                                >
                                    {isSaving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3"
                    >
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Check size={20} />
                        </div>
                        <span className="font-black text-sm uppercase tracking-wide">Profile Updated Successfully!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Photo Confirmation Modal */}
            <AnimatePresence>
                {isConfirmOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsConfirmOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-8">
                                <div className="flex flex-col items-center">
                                    <h3 className="text-xl font-black text-slate-800 mb-2">Update Photo?</h3>
                                    <p className="text-sm text-slate-500 font-medium mb-8">Are you sure you want to use this new photo?</p>

                                    <div className="w-40 h-40 rounded-[2.2rem] bg-slate-100 overflow-hidden mb-8 border-4 border-slate-50 shadow-inner">
                                        <img src={previewImage!} alt="Preview" className="w-full h-full object-cover" />
                                    </div>

                                    <div className="w-full space-y-3">
                                        <button
                                            onClick={confirmPhoto}
                                            className="w-full py-4 bg-[#1500FF] hover:bg-slate-900 text-white font-black rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10"
                                        >
                                            Yes, Change Photo
                                        </button>
                                        <button
                                            onClick={() => { setIsConfirmOpen(false); setPreviewImage(null); }}
                                            className="w-full py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
