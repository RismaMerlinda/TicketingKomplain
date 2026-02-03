"use client";

import Header from "@/app/components/Header";
import { FileBarChart } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="min-h-screen">
            <Header title="Reports & Analytics" subtitle="Performance metrics and insights" />

            <main className="p-8">
                <div className="flex flex-col items-center justify-center p-20 bg-neutral-item rounded-3xl border border-white/10 text-center">
                    <div className="w-16 h-16 bg-status-warning/10 rounded-2xl flex items-center justify-center mb-4">
                        <FileBarChart className="text-status-warning" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h2>
                    <p className="text-text-muted max-w-md">Detailed reporting dashboard with exportable capabilities will be available here.</p>
                </div>
            </main>
        </div>
    );
}
