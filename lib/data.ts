export type Product = "Catatmak" | "Joki Informatika" | "Orbit Billiard";
export type Status = "New" | "In Progress" | "Pending" | "Done";
export type Priority = "Low" | "Medium" | "High";
export type Source = "WA" | "IG" | "Email" | "Website" | "Other";

export interface Ticket {
    id: string;
    code: string;
    product: Product;
    source: Source;
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    deadline: string;
    createdAt: string;
    customerName?: string;
    isOverdue: boolean;
}

export const MOCK_TICKETS: Ticket[] = [
    {
        id: "1",
        code: "TKT-001",
        product: "Catatmak",
        source: "WA",
        title: "Gagal login di web admin",
        description: "User melaporkan tidak bisa login meskipun password sudah benar.",
        status: "New",
        priority: "High",
        deadline: "2026-02-03",
        createdAt: "2026-02-02",
        isOverdue: false,
    },
    {
        id: "2",
        code: "TKT-002",
        product: "Joki Informatika",
        source: "Email",
        title: "Perubahan deadline pengerjaan",
        description: "Request percepatan deadline pengerjaan module autentikasi.",
        status: "In Progress",
        priority: "Medium",
        deadline: "2026-02-01",
        createdAt: "2026-01-30",
        isOverdue: true,
    },
    {
        id: "3",
        code: "TKT-003",
        product: "Orbit Billiard",
        source: "Website",
        title: "Sistem booking error",
        description: "Tombol booking di halaman utama tidak merespon saat diklik.",
        status: "Pending",
        priority: "High",
        deadline: "2026-02-05",
        createdAt: "2026-02-01",
        isOverdue: false,
    },
    {
        id: "4",
        code: "TKT-004",
        product: "Catatmak",
        source: "IG",
        title: "Pertanyaan fitur baru",
        description: "User menanyakan kapan fitur laporan bulanan dirilis.",
        status: "Done",
        priority: "Low",
        deadline: "2026-02-10",
        createdAt: "2026-01-25",
        isOverdue: false,
    },
];

export interface ProductData {
    id: string; // e.g., 'orbit'
    name: string; // e.g., 'Orbit Billiard'
    description?: string;
    icon?: string; // URL or type
    adminEmail?: string;
    adminPassword?: string; // Mock only
    trend: { name: string; tickets: number; resolved: number }[];
    stats: { total: number; active: number; resolved: number; satisfaction: number };
    dist: { name: string; value: number; color: string }[];
    activity: { text: string; time: string; user: string }[];
}

export const MOCK_PRODUCTS: Record<string, ProductData> = {
    "orbit-billiard": {
        id: "orbit-billiard",
        name: "Orbit Billiard",
        description: "Billiard management system",
        adminEmail: "admin@adminorbit.co.id",
        adminPassword: "password123",
        trend: [
            { name: 'Mon', tickets: 5, resolved: 4 },
            { name: 'Tue', tickets: 8, resolved: 6 },
            { name: 'Wed', tickets: 6, resolved: 5 },
            { name: 'Thu', tickets: 10, resolved: 9 },
            { name: 'Fri', tickets: 12, resolved: 10 },
            { name: 'Sat', tickets: 4, resolved: 3 },
            { name: 'Sun', tickets: 2, resolved: 2 },
        ],
        stats: { total: 120, active: 15, resolved: 105, satisfaction: 4.5 },
        dist: [
            { name: 'Resolved', value: 105, color: '#10B981' },
            { name: 'In Progress', value: 10, color: '#F59E0B' },
            { name: 'Pending', value: 5, color: '#64748B' },
        ],
        activity: [
            { text: "Table 4 reservation issue resolved", time: "10 min ago", user: "Admin Orbit" },
            { text: "New booking request #ORB-202", time: "32 min ago", user: "System" },
            { text: "Payment gateway synced", time: "2 hrs ago", user: "Manager" }
        ]
    },
    catatmak: {
        id: "catatmak",
        name: "Catatmak",
        description: "Note taking and marking app",
        adminEmail: "admin@admincatatmak.co.id",
        adminPassword: "password123",
        trend: [
            { name: 'Mon', tickets: 15, resolved: 12 },
            { name: 'Tue', tickets: 20, resolved: 18 },
            { name: 'Wed', tickets: 18, resolved: 15 },
            { name: 'Thu', tickets: 25, resolved: 22 },
            { name: 'Fri', tickets: 30, resolved: 28 },
            { name: 'Sat', tickets: 10, resolved: 8 },
            { name: 'Sun', tickets: 8, resolved: 6 },
        ],
        stats: { total: 450, active: 35, resolved: 415, satisfaction: 4.8 },
        dist: [
            { name: 'Resolved', value: 415, color: '#10B981' },
            { name: 'In Progress', value: 25, color: '#F59E0B' },
            { name: 'Pending', value: 10, color: '#64748B' },
        ],
        activity: [
            { text: "Sync bug on iOS fixed", time: "5 min ago", user: "Dev Team" },
            { text: "User feedback report generated", time: "1 hr ago", user: "Admin Catatmark" },
            { text: "New premium subscription #CM-900", time: "3 hrs ago", user: "System" }
        ]
    },
    "joki-informatika": {
        id: "joki-informatika",
        name: "Joki Informatika",
        description: "Academic assistance platform",
        adminEmail: "admin@adminjoki.co.id",
        adminPassword: "password123",
        trend: [
            { name: 'Mon', tickets: 30, resolved: 20 },
            { name: 'Tue', tickets: 45, resolved: 35 },
            { name: 'Wed', tickets: 40, resolved: 30 },
            { name: 'Thu', tickets: 50, resolved: 40 },
            { name: 'Fri', tickets: 60, resolved: 50 },
            { name: 'Sat', tickets: 25, resolved: 15 },
            { name: 'Sun', tickets: 20, resolved: 15 },
        ],
        stats: { total: 890, active: 85, resolved: 805, satisfaction: 4.2 },
        dist: [
            { name: 'Resolved', value: 805, color: '#10B981' },
            { name: 'In Progress', value: 60, color: '#F59E0B' },
            { name: 'Pending', value: 25, color: '#64748B' },
        ],
        activity: [
            { text: "Assignment help request #JK-88", time: "2 min ago", user: "Admin Joki" },
            { text: "Tutor assigned to Ticket #JK-42", time: "15 min ago", user: "System" },
            { text: "Refund processed for user #992", time: "4 hrs ago", user: "Finance" }
        ]
    }
};
