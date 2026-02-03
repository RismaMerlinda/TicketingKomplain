import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Ticket } from "./types";
import { isAfter, parseISO, format, startOfMonth, subMonths, isSameMonth } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isOverdue(ticket: Ticket): boolean {
    if (ticket.status === "Done" || ticket.status === "Closed") return false;
    return isAfter(new Date(), parseISO(ticket.resolveDueAt));
}

export function getStatusColor(status: string) {
    switch (status) {
        case "New": return "bg-blue-100 text-blue-700 border-blue-200";
        case "In Progress": return "bg-amber-100 text-amber-700 border-amber-200";
        case "Pending": return "bg-zinc-100 text-zinc-700 border-zinc-200";
        case "Done": return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "Closed": return "bg-zinc-100 text-zinc-500 border-zinc-200";
        default: return "bg-zinc-100 text-zinc-700";
    }
}

export function getPriorityColor(priority: string) {
    switch (priority) {
        case "High": return "bg-red-100 text-red-700 border-red-200";
        case "Medium": return "bg-orange-100 text-orange-700 border-orange-200";
        case "Low": return "bg-blue-100 text-blue-700 border-blue-200";
        default: return "bg-zinc-100 text-zinc-700";
    }
}

export function formatDateTime(dateStr: string) {
    return format(parseISO(dateStr), "dd MMM yyyy, HH:mm");
}

export function getMonthlyStats(tickets: Ticket[]) {
    const months = Array.from({ length: 6 }).map((_, i) => subMonths(new Date(), i)).reverse();

    return months.map(month => {
        const monthStr = format(month, "MMM yyyy");
        const incoming = tickets.filter(t => isSameMonth(parseISO(t.createdAt), month)).length;
        const resolved = tickets.filter(t => t.resolvedAt && isSameMonth(parseISO(t.resolvedAt), month)).length;

        return {
            month: monthStr,
            incoming,
            resolved
        };
    });
}
