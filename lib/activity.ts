"use client";

export interface ActivityLog {
    id: string;
    text: string;
    user: string;
    time: string; // Keep for legacy but we'll use timestamp mostly
    product: string | null;
    timestamp: number;
}

export const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    // Fallback to date
    return new Date(timestamp).toLocaleDateString();
};

export const getStoredLogs = (): ActivityLog[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('ticketing_activities');
    return stored ? JSON.parse(stored) : [];
};

export const logActivity = (text: string, userName: string, productId: string | null = null) => {
    if (typeof window === 'undefined') return;

    const logs = getStoredLogs();
    const newLog: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        user: userName,
        time: "Just now",
        product: productId,
        timestamp: Date.now()
    };

    const updatedLogs = [newLog, ...logs].slice(0, 100);
    localStorage.setItem('ticketing_activities', JSON.stringify(updatedLogs));
    window.dispatchEvent(new Event('activityUpdated'));
};
