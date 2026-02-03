"use client";

import Header from "@/app/components/Header";

export default function ProductsPage() {
    return (
        <div className="min-h-screen pb-12 bg-[#F8FAFC]">
            <Header title="Products" subtitle="Manage Software Products" />
            <div className="max-w-[1600px] mx-auto px-8 py-8">
                <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Product Management</h2>
                    <p className="text-slate-500 mt-2">This module is under construction.</p>
                </div>
            </div>
        </div>
    );
}
