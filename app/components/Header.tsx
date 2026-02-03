"use client";

import { Bell, Search, Settings, Menu } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

export default function Header({ title = "Overview", subtitle = "Operations Control Center" }: { title?: string, subtitle?: string }) {
    const { toggle } = useSidebar();

    return (
        <header className="sticky top-0 z-30 w-full mb-0">
            {/* White Header Background with Glass Effect */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60" />

            <div className="relative h-16 px-6 flex items-center justify-between">

                {/* Left: Title & Breadcrumb vibe */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggle}
                        className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors md:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex flex-col justify-center">
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            {title}
                        </h1>
                        <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1500FF]" />
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-6">

                    {/* Modern Search */}
                    <div className="relative group hidden lg:block">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-slate-400 group-focus-within:text-[#1500FF] transition-colors" size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search system..."
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#1500FF] focus:border-[#1500FF] transition-all w-64 shadow-sm"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-mono text-slate-400">Ctrl K</kbd>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

                    {/* Action Icons */}
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all group">
                            <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
                        </button>
                        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all group">
                            <Bell size={20} className="group-hover:animate-swing" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#00E5FF] rounded-full ring-2 ring-white animate-pulse" />
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
}
