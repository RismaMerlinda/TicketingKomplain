"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    variant = "danger"
}: ConfirmModalProps) {
    const colors = {
        danger: {
            bg: "bg-rose-50",
            icon: "text-rose-500",
            button: "bg-rose-500 hover:bg-rose-600 shadow-rose-200",
            ring: "focus:ring-rose-500/20"
        },
        warning: {
            bg: "bg-amber-50",
            icon: "text-amber-500",
            button: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
            ring: "focus:ring-amber-500/20"
        },
        info: {
            bg: "bg-blue-50",
            icon: "text-blue-500",
            button: "bg-blue-500 hover:bg-blue-600 shadow-blue-200",
            ring: "focus:ring-blue-500/20"
        }
    };

    const style = colors[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 ${style.bg} ${style.icon} rounded-2xl flex items-center justify-center mb-6`}>
                                    <AlertTriangle size={32} />
                                </div>

                                <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`w-full py-4 rounded-2xl text-white font-black text-sm transition-all shadow-lg active:scale-[0.98] ${style.button}`}
                                >
                                    {confirmText}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 rounded-2xl bg-slate-200/50 text-slate-700 font-bold text-sm hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-[0.98] border border-slate-300/40"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>

                        {/* Top-right close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
