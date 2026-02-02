import { Product, Ticket } from "./types";
import { addDays, subDays, startOfMonth } from "date-fns";

export const mockProducts: Product[] = [
    { id: "P1", name: "Product A", isActive: true },
    { id: "P2", name: "Product B", isActive: true },
    { id: "P3", name: "Service C", isActive: true },
    { id: "P4", name: "Legacy X", isActive: false },
];

const now = new Date();

export const mockTickets: Ticket[] = [
    {
        id: "T1",
        ticketCode: "TKT-001",
        title: "Login issues on mobile",
        description: "User cannot login using the mobile app since the last update.",
        productId: "P1",
        productName: "Product A",
        source: "WhatsApp",
        priority: "High",
        status: "In Progress",
        createdAt: subDays(now, 2).toISOString(),
        responseDueAt: subDays(now, 1.5).toISOString(),
        resolveDueAt: subDays(now, 1).toISOString(), // Overdue
        attachments: [{ name: "screenshot.png", url: "#" }],
        activities: [
            { at: subDays(now, 2).toISOString(), type: "System", by: "Bot", message: "Ticket Created" },
            { at: subDays(now, 1.8).toISOString(), type: "Status Transition", by: "Admin 1", message: "Changed status to In Progress" },
        ],
        comments: [
            { at: subDays(now, 1.9).toISOString(), by: "User123", message: "Please fix this quickly!" },
        ],
    },
    {
        id: "T2",
        ticketCode: "TKT-002",
        title: "Billing dispute",
        description: "Double charged for the monthly subscription.",
        productId: "P2",
        productName: "Product B",
        source: "Email",
        priority: "Medium",
        status: "New",
        createdAt: subDays(now, 0.5).toISOString(),
        responseDueAt: addDays(now, 0.5).toISOString(),
        resolveDueAt: addDays(now, 2).toISOString(),
        attachments: [],
        activities: [{ at: subDays(now, 0.5).toISOString(), type: "System", by: "Bot", message: "Ticket Created" }],
        comments: [],
    },
    {
        id: "T3",
        ticketCode: "TKT-003",
        title: "Feature request: Dark mode",
        description: "User wants dark mode in the dashboard.",
        productId: "P3",
        productName: "Service C",
        source: "Website",
        priority: "Low",
        status: "Done",
        createdAt: subDays(now, 10).toISOString(),
        responseDueAt: subDays(now, 9).toISOString(),
        resolveDueAt: subDays(now, 5).toISOString(),
        resolvedAt: subDays(now, 6).toISOString(),
        attachments: [],
        activities: [
            { at: subDays(now, 10).toISOString(), type: "System", by: "Bot", message: "Ticket Created" },
            { at: subDays(now, 6).toISOString(), type: "Status Transition", by: "Admin 2", message: "Marked as Done" },
        ],
        comments: [],
    },
    {
        id: "T4",
        ticketCode: "TKT-004",
        title: "Error 500 on checkout",
        description: "Intermittent 500 error when clicking checkout button.",
        productId: "P1",
        productName: "Product A",
        source: "Instagram",
        priority: "High",
        status: "Pending",
        createdAt: subDays(now, 1).toISOString(),
        responseDueAt: subDays(now, 0.5).toISOString(),
        resolveDueAt: addDays(now, 1).toISOString(),
        attachments: [],
        activities: [],
        comments: [],
    }
];
