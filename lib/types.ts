export type TicketSource = "WhatsApp" | "Instagram" | "Email" | "Website" | "Other";
export type TicketPriority = "Low" | "Medium" | "High";
export type TicketStatus = "New" | "In Progress" | "Pending" | "Done" | "Closed";

export interface Attachment {
    name: string;
    url: string;
}

export interface Activity {
    at: string;
    type: string;
    by: string;
    message: string;
}

export interface Comment {
    at: string;
    by: string;
    message: string;
}

export interface Ticket {
    id: string;
    ticketCode: string;
    title: string;
    description: string;
    productId: string;
    productName: string;
    source: TicketSource;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    responseDueAt: string;
    resolveDueAt: string;
    resolvedAt?: string | null;
    attachments: Attachment[];
    activities: Activity[];
    comments: Comment[];
}

export interface Product {
    id: string;
    name: string;
    isActive: boolean;
}
