"use client";

export interface Product {
    id: string;
    name: string;
    description: string;
    icon?: string;
    adminEmail: string;
    adminPassword: string;
}

const API_URL = 'http://127.0.0.1:5900/api/products';

/**
 * Fetch all products from MongoDB via API
 */
export const getStoredProducts = async (): Promise<Product[]> => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);

        const data = await response.json();

        // Handle if data is Object (Record<string, Product>) or Array
        const productsArray = Array.isArray(data) ? data : Object.values(data);

        return productsArray.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            icon: p.icon,
            adminEmail: p.adminEmail,
            adminPassword: p.adminPassword
        }));
    } catch (e) {
        console.error("API Fetch Error for products:", e);
        // Fallback to empty array
        return [];
    }
};

/**
 * Add a new product to MongoDB via API
 */
export const addProduct = async (product: Omit<Product, 'id'>): Promise<boolean> => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            window.dispatchEvent(new Event('productsUpdated'));
            return true;
        }
        return false;
    } catch (e) {
        console.error("API Add Product Error:", e);
        return false;
    }
};

/**
 * Update an existing product in MongoDB via API
 */
export const updateProduct = async (id: string, product: Partial<Product>): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            window.dispatchEvent(new Event('productsUpdated'));
            return true;
        }
        return false;
    } catch (e) {
        console.error("API Update Product Error:", e);
        return false;
    }
};

/**
 * Delete a product from MongoDB via API
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            window.dispatchEvent(new Event('productsUpdated'));
            return true;
        }
        return false;
    } catch (e) {
        console.error("API Delete Product Error:", e);
        return false;
    }
};
