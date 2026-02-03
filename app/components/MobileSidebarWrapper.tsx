"use client";

import { useSidebar } from "../context/SidebarContext";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function MobileSidebarWrapper() {
    const { isOpen, close } = useSidebar();

    return (
        <>
            {/* Desktop Sidebar (Fixed) */}
            <div className="hidden md:block fixed left-0 top-0 h-screen w-72 z-50">
                <Sidebar />
            </div>

            {/* Mobile Sidebar (Overlay + Drawer) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={close}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 h-screen w-72 z-[70] md:hidden shadow-2xl"
                        >
                            <Sidebar />

                            {/* Close Button */}
                            <button
                                onClick={close}
                                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-slate-500 hover:text-rose-600 md:hidden"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
