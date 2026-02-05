"use client";

import { MOCK_TICKETS } from "./data";

export interface TicketData {
    id: string;
    code: string;
    status: "New" | "In Progress" | "Pending" | "Overdue" | "Done" | "Closed";
    title: string;
    description?: string;
    product: string;
    source: "WhatsApp" | "Instagram" | "Facebook" | "X" | "Website" | "Email" | "App / In-App" | "Offline / Manual" | "Other";
    priority: "High" | "Medium" | "Low";
    prioritySetAt?: string;
    responseDue: string;
    resolveDue: string;
    createdAt: string;
    customer: string;
}

const STORAGE_KEY = 'ticketing_tickets';

// Convert old mock data format to new format if needed
const mapMockTicket = (t: any): TicketData => ({
    id: t.id,
    code: t.code,
    status: t.status as any,
    title: t.title,
    description: t.description,
    product: t.product,
    source: t.source === 'WA' ? 'WhatsApp' : t.source,
    priority: t.priority as any,
    prioritySetAt: t.createdAt + " · 00:00",
    responseDue: t.deadline + " · 17:00",
    resolveDue: t.deadline + " · 17:00",
    createdAt: t.createdAt + " · 00:00",
    customer: t.customerName || "Customer"
});

export const getStoredTickets = (): TicketData[] => {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // Initialize with mock data if empty
        // Note: MOCK_TICKETS in data.ts has a slightly different structure than TicketsPage
        // For simplicity, I'll just return an empty array or hardcoded ones that match TicketsPage
        return [];
    }
    return JSON.parse(stored);
};

export const saveTickets = (tickets: TicketData[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event('ticketsUpdated'));
};

export const addTicket = (ticket: TicketData) => {
    const tickets = getStoredTickets();
    saveTickets([ticket, ...tickets]);
};

export const updateTicket = (ticket: TicketData) => {
    const tickets = getStoredTickets();
    saveTickets(tickets.map(t => t.id === ticket.id ? ticket : t));
};

export const deleteTicket = (id: string) => {
    const tickets = getStoredTickets();
    saveTickets(tickets.filter(t => t.id !== id));
};
