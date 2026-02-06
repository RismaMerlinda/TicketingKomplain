
export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    PRODUCT_ADMIN: "PRODUCT_ADMIN"
};

const DEFAULT_USERS = [
    {
        email: "admin@superadmin.co.id",
        password: "password123",
        name: "Super Admin",
        role: ROLES.SUPER_ADMIN,
        productId: null
    },
    {
        email: "jokiinformatika@gmail.com",
        password: "joki123",
        name: "Admin Joki",
        role: ROLES.PRODUCT_ADMIN,
        productId: "joki"
    },
    {
        email: "orbitbilliard.id@gmail.com",
        password: "orbit123",
        name: "Admin Orbit",
        role: ROLES.PRODUCT_ADMIN,
        productId: "orbit"
    },
    {
        email: "hi@catatmak.com",
        password: "catatmak123",
        name: "Admin Catatmak",
        role: ROLES.PRODUCT_ADMIN,
        productId: "catatmak"
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

    // 1. Exact Match with Password Check
    const foundUser = users.find((u: any) => u.email === email);

    if (foundUser) {
        // If password is provided, check it. If not, fail (or handle as needed, but for login it's required)
        if (foundUser.password === password) {
            return foundUser;
        }
    }

    // Dynamic Pattern Matching REMOVED to enforce strict system credentials

    return undefined;
};
