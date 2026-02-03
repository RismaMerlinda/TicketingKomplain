"use client";

import Header from "@/app/components/Header";

export default function ProfilePage() {
    return (
        <div className="min-h-screen pb-12 bg-[#F8FAFC]">
            <Header title="Profile" subtitle="User Settings" />
            <div className="max-w-[1600px] mx-auto px-8 py-8">
                <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">My Profile</h2>
                    <p className="text-slate-500 mt-2">Profile settings will appear here.</p>
                </div>
            </div>
        </div>
    );
}
