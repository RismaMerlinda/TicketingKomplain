"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Ticket,
    Kanban,
    PlusSquare,
    Package,
    BarChart3,
    Download,
    Settings
} from "lucide-react";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Ticket, label: "Tickets List", href: "/tickets" },
    { icon: Kanban, label: "Tickets Kanban", href: "/tickets/kanban" },
    { icon: PlusSquare, label: "Create Ticket", href: "/tickets/create" },
    { icon: Package, label: "Products", href: "/products" },
    { icon: BarChart3, label: "Reports", href: "/reports/monthly" },
    { icon: Download, label: "Export", href: "/export" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-white dark:bg-zinc-950">
            <div className="flex h-16 items-center px-6">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">TKT Admin</h1>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

// Topbar
import { Search, User } from "lucide-react";
import { Input } from "../ui/input-badge";
import { Button } from "../ui/button";

export function Topbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 dark:bg-zinc-950">
            <div className="flex w-full max-w-sm items-center gap-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search tickets..."
                        className="pl-9 h-9 w-full bg-zinc-50/50"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}

// Layout Wrapper
export function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
