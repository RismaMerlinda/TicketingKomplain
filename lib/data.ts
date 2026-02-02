export type Product = "Catatmark" | "Joki Informatika" | "Orbit Billiard";
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
        product: "Catatmark",
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
        product: "Catatmark",
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
