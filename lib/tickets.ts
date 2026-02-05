"use client";

// MOCK_TICKETS import removed to avoid conflict with local definition

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

export const MOCK_TICKETS: TicketData[] = [
    {
        id: "1",
        code: "TCK-0142",
        status: "New",
        title: "Login failure on main dashboard after update",
        description: "User cannot access the dashboard after the recent v2.3 deployment. Getting 403 Forbidden.",
        product: "Catatmak",
        source: "WhatsApp",
        priority: "High",
        prioritySetAt: "05 Feb 2026 · 09:00",
        responseDue: "05 Feb · 11:00",
        resolveDue: "05 Feb · 17:00",
        createdAt: "10 mins ago",
        customer: "Budi Santoso"
    },
    {
        id: "2",
        code: "TCK-0143",
        status: "In Progress",
        title: "Bill export returning 500 server error",
        description: "Exporting PDF for monthly bills fails when date range > 30 days.",
        product: "Orbit Billiard",
        source: "Website",
        priority: "High",
        prioritySetAt: "04 Feb 2026 · 14:20",
        responseDue: "04 Feb · 15:20",
        resolveDue: "05 Feb · 10:00",
        createdAt: "2 hrs ago",
        customer: "Dewi Lestari"
    },
    {
        id: "3",
        code: "TCK-0140",
        status: "Pending",
        title: "Feature request: Dark mode for mobile app",
        product: "Joki Informatika",
        source: "Email",
        priority: "Low",
        prioritySetAt: "03 Feb 2026 · 10:00",
        responseDue: "04 Feb · 10:00",
        resolveDue: "10 Feb · 10:00",
        createdAt: "1 day ago",
        customer: "Rian Hidayat"
    },
    {
        id: "4",
        code: "TCK-0138",
        status: "Overdue",
        title: "Payment gateway timeout on BCA Virtual Account",
        product: "Orbit Billiard",
        source: "WhatsApp",
        priority: "High",
        prioritySetAt: "02 Feb 2026 · 08:30",
        responseDue: "02 Feb · 10:30",
        resolveDue: "02 Feb · 12:30",
        createdAt: "2 days ago",
        customer: "Siti Aminah"
    },
    {
        id: "5",
        code: "TCK-0145",
        status: "New",
        title: "User cannot reset password via email link",
        product: "Catatmak",
        source: "Email",
        priority: "Medium",
        prioritySetAt: "05 Feb 2026 · 10:45",
        responseDue: "05 Feb · 14:45",
        resolveDue: "06 Feb · 10:45",
        createdAt: "30 mins ago",
        customer: "Eko Prasetyo"
    },
    {
        id: "6",
        code: "TCK-0135",
        status: "Done",
        title: "Integrate new inventory module",
        product: "Joki Informatika",
        source: "Website",
        priority: "Medium",
        prioritySetAt: "01 Feb 2026 · 09:00",
        responseDue: "01 Feb · 13:00",
        resolveDue: "02 Feb · 09:00",
        createdAt: "3 days ago",
        customer: "Fajar Nugraha"
    },
    {
        id: "7",
        code: "TCK-0130",
        status: "Closed",
        title: "Spam inquiry ticket regarding promo",
        product: "Catatmak",
        source: "Website",
        priority: "Low",
        prioritySetAt: "30 Jan 2026 · 11:00",
        responseDue: "-",
        resolveDue: "-",
        createdAt: "5 days ago",
        customer: "Anonymous"
    },
    {
        id: "8",
        code: "TCK-0146",
        status: "In Progress",
        title: "Sidebar navigation glitch on tablet view",
        product: "Catatmak",
        source: "WhatsApp",
        priority: "Medium",
        prioritySetAt: "05 Feb 2026 · 08:15",
        responseDue: "05 Feb · 11:15",
        resolveDue: "05 Feb · 20:15",
        createdAt: "1 hr ago",
        customer: "Indah Permata"
    },
];

export const getStoredTickets = (): TicketData[] => {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // Initialize with default MOCK_TICKETS if empty
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TICKETS));
        return MOCK_TICKETS;
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
