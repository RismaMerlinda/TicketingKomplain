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
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
// @ts-ignore
import { navConfig } from "@/navConfig";

// Helper for conditional classes
function cx(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { close } = useSidebar();
    const { user, logout } = useAuth();

    // Filter Logic
    const filteredMainMenu = navConfig.mainMenu.filter((item: any) =>
        !item.roles || (user?.role && item.roles.includes(user.role))
    );

    const filteredManagementMenu = navConfig.managementMenu.filter((item: any) =>
        !item.roles || (user?.role && item.roles.includes(user.role))
    );

    return (
        <aside className={cx("h-full w-full flex flex-col bg-white border-r border-slate-100", className)}>

            {/* Brand */}
            <div className="h-20 flex-shrink-0 flex items-center px-8 mb-2">
                <div className="flex items-center gap-4">
                    <Image
                        src="/logo_sidebar.png"
                        alt="Brand Logo"
                        width={36}
                        height={36}
                        className="object-contain"
                    />
                    <div className="flex flex-col justify-center">
                        <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                            {user?.role === 'SUPER_ADMIN' ? 'Super' : 'Product'}
                            <span className="text-[#1500FF]">Admin</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">
                            {user?.productId ? user.productId.toUpperCase() : 'Control Panel'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-6 space-y-8 overflow-y-auto mt-2 scrollbar-hide">

                {/* Main Menu */}
                <div>
                    <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-3">Main Menu</div>
                    <div className="space-y-1">
                        {filteredMainMenu.map((item: any) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={close}
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
                        {filteredManagementMenu.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={close}
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
            <div className="p-6 flex-shrink-0">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3 w-full mb-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-extrabold text-[#1500FF] shadow-sm">
                            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 truncate">{user?.name || 'User'}</div>
                            <div className="text-[11px] text-slate-500 truncate font-medium">{user?.email || 'user@email.com'}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            href="/dashboard/profile"
                            onClick={close}
                            className="flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:border-[#1500FF]/30 hover:text-[#1500FF] transition-all"
                        >
                            <UserCircle size={14} /> Profile
                        </Link>
                        <button
                            onClick={logout}
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
