import {
    LayoutDashboard,
    Ticket,
    Package,
    Users,
    FileBarChart,
    Activity
} from "lucide-react";

export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    PRODUCT_ADMIN: "PRODUCT_ADMIN"
};

export const navConfig = {
    mainMenu: [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            roles: [ROLES.SUPER_ADMIN, ROLES.PRODUCT_ADMIN]
        },
        {
            title: "Tickets",
            href: "/dashboard/tickets",
            icon: Ticket,
            roles: [ROLES.SUPER_ADMIN, ROLES.PRODUCT_ADMIN]
        },
    ],
    managementMenu: [
        {
            title: "Products",
            href: "/dashboard/products",
            icon: Package,
            roles: [ROLES.SUPER_ADMIN]
        },
        {
            title: "Product Admins",
            href: "/dashboard/admins",
            icon: Users,
            roles: [ROLES.SUPER_ADMIN]
        },
        {
            title: "Reports",
            href: "/dashboard/reports",
            icon: FileBarChart,
            roles: [ROLES.SUPER_ADMIN, ROLES.PRODUCT_ADMIN]
        },
        {
            title: "Activity Logs",
            href: "/dashboard/activity",
            icon: Activity,
            roles: [ROLES.SUPER_ADMIN]
        },
    ]
};
