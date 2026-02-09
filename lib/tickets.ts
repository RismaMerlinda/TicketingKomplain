"use client";

// MOCK_TICKETS import removed to avoid conflict with local definition

export type TicketStatus = "New" | "In Progress" | "Pending" | "Overdue" | "Done" | "Closed" | "Resolved";

export interface TicketData {
    id: string;
    code: string;
    status: TicketStatus;
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
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    solution?: string;
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


const API_URL = 'http://127.0.0.1:5900/api/tickets';

/**
 * Fetch all tickets from MongoDB via API
 */
export const getStoredTickets = async (): Promise<TicketData[]> => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Failed to fetch tickets: ${response.status}`);

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Expected JSON but got:", text.substring(0, 50));
            throw new Error("Invalid response format from server");
        }

        const data = await response.json();

        // If empty, try to seed automatically if needed (consider frontend behavior here)
        if (!data || data.length === 0) {
            console.log("Database empty.");
            return [];
        }

        const now = new Date();
        // Map backend format to frontend format
        return data.map((t: any) => {
            // Normalize Status
            let status: TicketStatus = ((): TicketStatus => {
                const s = String(t.status || 'New').toLowerCase().replace('_', ' ');
                if (s === 'new') return 'New';
                if (s === 'pending') return 'Pending';
                if (s === 'in progress') return 'In Progress';
                if (s === 'overdue' || s === 'critical') return 'Overdue';
                if (s === 'done' || s === 'resolved') return 'Done';
                if (s === 'closed') return 'Closed';
                return 'New';
            })();

            // Auto-Overdue Check: If not Done/Closed and past deadline
            if (status !== "Done" && status !== "Closed" && t.endDate && t.endTime) {
                const deadlineStr = `${t.endDate.split('/').reverse().join('-')}T${t.endTime}`;
                const deadline = new Date(deadlineStr);
                if (!isNaN(deadline.getTime()) && deadline < now) {
                    status = "Overdue";
                }
            }

            // Normalize Priority
            let priority = t.priority || "Medium";
            if (priority.toLowerCase() === 'high' || priority.toLowerCase() === 'critical') priority = "High";
            if (priority.toLowerCase() === 'medium') priority = "Medium";
            if (priority.toLowerCase() === 'low') priority = "Low";

            return {
                id: t._id,
                code: t.code,
                status,
                title: t.title,
                description: t.description,
                product: t.product || t.productName || "",
                source: t.source || t.platform || "WhatsApp",
                priority: priority as any,
                prioritySetAt: t.prioritySetAt || (t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Today"),
                responseDue: t.responseDue || (t.startDate ? `${t.startDate} · ${t.startTime}` : "ASAP"),
                resolveDue: t.resolveDue || (t.endDate ? `${t.endDate} · ${t.endTime}` : "TBD"),
                createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
                customer: t.customerName || t.customer || "Customer",
                startDate: t.startDate,
                startTime: t.startTime,
                endDate: t.endDate,
                endTime: t.endTime,
                solution: t.solution || ""
            };
        });
    } catch (e) {
        console.error("API Fetch Error, falling back to mock:", e);
        return MOCK_TICKETS;
    }
};

/**
 * Add a new ticket to MongoDB via API
 */
export const addTicket = async (ticket: any): Promise<boolean> => {
    try {
        // Backend expects specific fields. Map them if needed.
        const payload = {
            ...ticket,
            customerName: ticket.customer,
            platform: ticket.source,
            // ID will be generated by MongoDB
        };
        delete (payload as any).id;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            window.dispatchEvent(new Event('ticketsUpdated'));
            return true;
        }
        return false;
    } catch (e) {
        console.error("API Add Error:", e);
        return false;
    }
};

/**
 * Update an existing ticket in MongoDB via API
 */
export const updateTicket = async (ticket: TicketData): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/${ticket.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket)
        });

        if (response.ok) {
            window.dispatchEvent(new Event('ticketsUpdated'));
            return true;
        }
        return false;
    } catch (e) {
        console.error("API Update Error:", e);
        return false;
    }
};

/**
 * Delete a ticket from MongoDB via API
 */
export const deleteTicket = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            window.dispatchEvent(new Event('ticketsUpdated'));
            return true;
        }
        return false;
    } catch (e) {
        console.error("API Delete Error:", e);
        return false;
    }
};

