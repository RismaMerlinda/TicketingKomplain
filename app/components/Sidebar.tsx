"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Ticket,
    Package,
    Users,
    FileBarChart,
    Activity,
    UserCircle,
    LogOut,
    Layers
} from "lucide-react";

// Helper for conditional classes
function cx(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

const mainMenuItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Tickets",
        href: "/dashboard/tickets",
        icon: Ticket,
    },
];

const managementMenuItems = [
    {
        title: "Products",
        href: "/dashboard/products",
        icon: Package,
    },
    {
        title: "Admin Produk",
        href: "/dashboard/admins",
        icon: Users,
    },
    {
        title: "Reports",
        href: "/dashboard/reports",
        icon: FileBarChart,
    },
    {
        title: "Activity Log",
        href: "/dashboard/activity",
        icon: Activity,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 flex flex-col z-50 bg-white border-r border-slate-100">

            {/* Brand */}
            <div className="h-20 flex items-center px-8 mb-2">
                <div className="flex items-center gap-4">
                    <Image
                        src="/logo_sidebar.png"
                        alt="Brand Logo"
                        width={36}
                        height={36}
                        className="object-contain"
                    />
                    <div className="flex flex-col justify-center">
                        <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">Super<span className="text-[#1500FF]">Admin</span></span>
                        <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Control Panel</span>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-6 space-y-8 overflow-y-auto mt-2">

                {/* Main Menu */}
                <div>
                    <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-3">Main Menu</div>
                    <div className="space-y-1">
                        {mainMenuItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cx(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative",
                                        isActive
                                            ? "bg-[#1500FF]/5 text-[#1500FF] font-bold"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                                    )}
                                >
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={cx(
                                            "transition-colors",
                                            isActive ? "text-[#1500FF]" : "text-slate-400 group-hover:text-slate-600"
                                        )}
                                    />
                                    <span className="text-[13px] tracking-wide">{item.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Management Menu */}
                <div>
                    <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-3">Management</div>
                    <div className="space-y-1">
                        {managementMenuItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cx(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative",
                                        isActive
                                            ? "bg-[#1500FF]/5 text-[#1500FF] font-bold"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                                    )}
                                >
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={cx(
                                            "transition-colors",
                                            isActive ? "text-[#1500FF]" : "text-slate-400 group-hover:text-slate-600"
                                        )}
                                    />
                                    <span className="text-[13px] tracking-wide">{item.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

            </nav>

            {/* User Mini Profile */}
            <div className="p-6">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3 w-full mb-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-extrabold text-[#1500FF] shadow-sm">
                            SA
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 truncate">Super Admin</div>
                            <div className="text-[11px] text-slate-500 truncate font-medium">system@ticketing.io</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            href="/dashboard/profile"
                            className="flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:border-[#1500FF]/30 hover:text-[#1500FF] transition-all"
                        >
                            <UserCircle size={14} /> Profile
                        </Link>
                        <button
                            className="flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold text-rose-600 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-all"
                        >
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
