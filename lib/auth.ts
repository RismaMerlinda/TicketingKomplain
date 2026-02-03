
export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    PRODUCT_ADMIN: "PRODUCT_ADMIN"
};

const DEFAULT_USERS = [
    {
        email: "admin@superadmin.co.id",
        password: "password123", // Simple for simulation
        name: "Super Admin",
        role: ROLES.SUPER_ADMIN,
        productId: null
    },
    {
        email: "admin@adminorbit.co.id",
        password: "password123",
        name: "Admin Orbit",
        role: ROLES.PRODUCT_ADMIN,
        productId: "orbit"
    },
    {
        email: "admin@admincatatmark.co.id",
        password: "password123",
        name: "Admin Catatmark",
        role: ROLES.PRODUCT_ADMIN,
        productId: "catatmark"
    },
    {
        email: "admin@adminjoki.co.id",
        password: "password123",
        name: "Admin Joki",
        role: ROLES.PRODUCT_ADMIN,
        productId: "joki"
    }
];

export const getStoredUsers = () => {
    if (typeof window === 'undefined') return DEFAULT_USERS;

    const stored = localStorage.getItem('ticketing_users');
    let users = stored ? JSON.parse(stored) : [];

    // MERGE: Ensure all DEFAULT_USERS are present (simple way to update for dev)
    let hasChanges = false;
    DEFAULT_USERS.forEach(defUser => {
        if (!users.find((u: any) => u.email === defUser.email)) {
            users.push(defUser);
            hasChanges = true;
        }
    });

    if (hasChanges || !stored) {
        localStorage.setItem('ticketing_users', JSON.stringify(users));
    }

    return users;
};

export const registerNewUser = (userData: any) => {
    const users = getStoredUsers();
    if (users.find((u: any) => u.email === userData.email)) {
        return false; // User exists
    }
    const newUsers = [...users, userData];
    localStorage.setItem('ticketing_users', JSON.stringify(newUsers));
    return true;
};

export const validateUser = (email: string, password?: string) => {
    const users = getStoredUsers();

    // 1. Exact Match
    const foundUser = users.find((u: any) => u.email === email);
    if (foundUser) return foundUser;

    // 2. Dynamic Pattern Matching (Smart Login)
    // Allows any email containing the product name to log in as that product admin
    const lowerEmail = email.toLowerCase();
    let productId = null;
    let name = "Admin Product";
    // Default to PRODUCT_ADMIN if matching a product pattern
    const role = ROLES.PRODUCT_ADMIN;

    if (lowerEmail.includes("joki") || lowerEmail.includes("informatika")) {
        productId = "joki";
        name = "Admin Joki Informatika";
    } else if (lowerEmail.includes("catatmark")) {
        productId = "catatmark";
        name = "Admin Catatmark";
    } else if (lowerEmail.includes("orbit")) {
        productId = "orbit";
        name = "Admin Orbit";
    }

    if (productId) {
        return {
            email: email,
            name: name,
            role: role,
            productId: productId
        };
    }

    return undefined;
};
