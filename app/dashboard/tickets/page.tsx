"use client";

import Header from "@/app/components/Header";
import { Ticket } from "lucide-react";

export default function TicketsPage() {
    return (
        <div className="min-h-screen">
            <Header title="All Tickets" subtitle="Manage and track support requests" />

            <main className="p-8">
                <div className="flex flex-col items-center justify-center p-20 bg-neutral-item rounded-3xl border border-white/10 text-center">
                    <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Ticket className="text-primary-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Ticket Management System</h2>
                    <p className="text-text-muted max-w-md">This module is under construction. It will feature a comprehensive data table with filters, sorting, and bulk actions.</p>
                </div>
            </main>
        </div>
    );
}
