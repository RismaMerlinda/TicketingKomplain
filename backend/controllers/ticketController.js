const Ticket = require('../models/Ticket');

// Get all tickets
exports.getTickets = async (req, res) => {
    try {
        const now = new Date();
        const tickets = await Ticket.find().sort({ createdAt: -1 });

        // Auto-update overdue status in DB
        let changed = false;
        for (let ticket of tickets) {
            if (
                ticket.status !== 'Done' &&
                ticket.status !== 'Closed' &&
                ticket.status !== 'Overdue' &&
                ticket.endDate &&
                ticket.endTime
            ) {
                // Parse date string YYYY-MM-DD and time HH:mm
                const deadline = new Date(`${ticket.endDate}T${ticket.endTime}`);
                if (deadline < now) {
                    ticket.status = 'Overdue';
                    await ticket.save();
                    changed = true;
                }
            }
        }

        // If any ticket was updated, we might need the fresh list, 
        // but the current 'tickets' array already has the updated status values
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a ticket
exports.createTicket = async (req, res) => {
    try {
        const ticketData = req.body;

        // Auto-generate Code per Product with Unique Prefix
        if (!ticketData.code) {
            let prefix = 'TKT';
            const productName = (ticketData.product || "").toLowerCase();

            if (productName.includes('joki')) prefix = 'JKI';
            else if (productName.includes('orbit')) prefix = 'ORB';
            else if (productName.includes('catatmak')) prefix = 'CMK';

            // Count only tickets for this specific product to get independent sequence
            const count = await Ticket.countDocuments({ product: ticketData.product });
            ticketData.code = `${prefix}-${String(count + 1).padStart(4, '0')}`;
        }

        const newTicket = new Ticket(ticketData);
        const savedTicket = await newTicket.save();
        res.status(201).json(savedTicket);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update Ticket
exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params; // Expects .code or ._id? Let's support _id or code
        const updates = req.body;

        // Try find by _id first, then code
        let updatedTicket;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            updatedTicket = await Ticket.findByIdAndUpdate(id, updates, { new: true });
        } else {
            updatedTicket = await Ticket.findOneAndUpdate({ code: id }, updates, { new: true });
        }

        if (!updatedTicket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        res.json(updatedTicket);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete Ticket
exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        let deleted;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            deleted = await Ticket.findByIdAndDelete(id);
        } else {
            deleted = await Ticket.findOneAndDelete({ code: id });
        }

        if (!deleted) return res.status(404).json({ message: "Ticket not found" });
        res.json({ message: "Ticket deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const Product = require('../models/Product'); // Import Product Model

// Seed Sample Tickets
exports.seedTickets = async (req, res) => {
    try {
        const count = await Ticket.countDocuments();
        if (count > 0) {
            return res.json({ message: "Database already has tickets. Skipping seed." });
        }

        // 1. Get Real Products to map IDs
        let products = await Product.find();

        // AUTO-SEED PRODUCTS IF EMPTY
        if (products.length === 0) {
            console.log("Database Product kosong. Seeding default products...");
            const defaultProducts = [
                {
                    id: "joki",
                    name: "Joki Informatika",
                    description: "Layanan bimbingan akademik & project IT",
                    icon: "https://ui-avatars.com/api/?name=Joki+Informatika&background=random",
                    adminEmail: "admin@joki.com",
                    adminPassword: "password123"
                },
                {
                    id: "orbit",
                    name: "Orbit Billiard",
                    description: "Platform sistem manajemen billiard (POS)",
                    icon: "https://ui-avatars.com/api/?name=Orbit+Billiard&background=random",
                    adminEmail: "admin@orbit.com",
                    adminPassword: "password123"
                },
                {
                    id: "catatmak",
                    name: "Catatmak",
                    description: "Aplikasi pencatatan keuangan UMKM",
                    icon: "https://ui-avatars.com/api/?name=Catatmak&background=random",
                    adminEmail: "admin@catatmak.com",
                    adminPassword: "password123"
                }
            ];

            await Product.insertMany(defaultProducts);
            products = await Product.find(); // Refresh list after insert
            console.log("✅ Default products created.");
        }

        // Helper map: Name -> ID
        // Normalizing to lowercase for easier matching
        const productMap = {};
        products.forEach(p => {
            productMap[p.name.toLowerCase()] = p.id;
            // Also support partial matches if needed, e.g. "orbit" -> id
            if (p.name.toLowerCase().includes('orbit')) productMap['orbit billiard'] = p.id;
            if (p.name.toLowerCase().includes('joki')) productMap['joki informatika'] = p.id;
            if (p.name.toLowerCase().includes('catat')) productMap['catatmak'] = p.id;
        });

        // 2. The Mock Data from Friend (lib/mock_tickets.ts)
        const mockTickets = [
            {
                code: "TCK-4742",
                status: "new",
                title: "Web 404",
                description: "Web 404 error reported via Whatsapp",
                productName: "Joki Informatika",
                source: "WhatsApp",
                priority: "medium",
                customer: "risma",
                createdAt: new Date() // approximate
            },
            {
                code: "TCK-4682",
                status: "new",
                title: "Website",
                description: "Website issue",
                productName: "Joki Informatika",
                source: "WhatsApp",
                priority: "high",
                customer: "lucinta luna",
                createdAt: new Date()
            },
            {
                code: "TCK-0142",
                status: "new",
                title: "Login failure on main dashboard after update",
                description: "User cannot access the dashboard after the recent v2.3 deployment. Getting 403 Forbidden.",
                productName: "Catatmak",
                source: "WhatsApp",
                priority: "high",
                customer: "Budi Santoso",
                createdAt: new Date(Date.now() - 10 * 60000) // 10 mins ago
            },
            {
                code: "TCK-0143",
                status: "in_progress",
                title: "Bill export returning 500 server error",
                description: "Exporting PDF for monthly bills fails when date range > 30 days.",
                productName: "Orbit Billiard",
                source: "Website",
                priority: "high",
                customer: "Dewi Lestari",
                createdAt: new Date(Date.now() - 2 * 3600000) // 2 hrs ago
            },
            {
                code: "TCK-0140",
                status: "pending",
                title: "Feature request: Dark mode for mobile app",
                productName: "Joki Informatika",
                source: "Email",
                priority: "low",
                customer: "Rian Hidayat",
                createdAt: new Date(Date.now() - 24 * 3600000) // 1 day ago
            },
            {
                code: "TCK-0138",
                status: "date_overdue", // Will map to valid enum
                title: "Payment gateway timeout on BCA Virtual Account",
                productName: "Orbit Billiard",
                source: "WhatsApp",
                priority: "high",
                customer: "Siti Aminah",
                createdAt: new Date(Date.now() - 48 * 3600000) // 2 days ago
            },
            {
                code: "TCK-0145",
                status: "new",
                title: "User cannot reset password via email link",
                productName: "Catatmak",
                source: "Email",
                priority: "medium",
                customer: "Eko Prasetyo",
                createdAt: new Date(Date.now() - 30 * 60000)
            },
            {
                code: "TCK-0135",
                status: "resolved", // Done -> Resolved
                title: "Integrate new inventory module",
                productName: "Joki Informatika",
                source: "Website",
                priority: "medium",
                customer: "Fajar Nugraha",
                createdAt: new Date(Date.now() - 72 * 3600000),
                resolvedAt: new Date()
            },
            {
                code: "TCK-0130",
                status: "closed",
                title: "Spam inquiry ticket regarding promo",
                productName: "Catatmak",
                source: "Website",
                priority: "low",
                customer: "Anonymous",
                createdAt: new Date(Date.now() - 120 * 3600000),
                resolvedAt: new Date()
            },
            {
                code: "TCK-0146",
                status: "in_progress",
                title: "Sidebar navigation glitch on tablet view",
                productName: "Catatmak",
                source: "WhatsApp",
                priority: "medium",
                customer: "Indah Permata",
                createdAt: new Date(Date.now() - 3600000)
            }
        ];

        // 3. Transform and Insert
        const ticketsToInsert = mockTickets.map(t => {
            // Map status
            let status = t.status.toLowerCase();
            if (status === 'done') status = 'resolved';
            if (status === 'overdue' || status === 'date_overdue') status = 'critical'; // Map overdue to critical if supported, or pending

            // Find Product ID
            const pId = productMap[t.productName.toLowerCase()];

            return {
                code: t.code,
                title: t.title,
                description: t.description || t.title,
                product: pId || products[0].id, // Fallback to first product if match fails
                priority: t.priority.toLowerCase(),
                status: status,
                customerName: t.customer,
                platform: t.source,
                createdAt: t.createdAt,
                resolvedAt: t.resolvedAt
            };
        });

        await Ticket.insertMany(ticketsToInsert);
        res.json({ message: `Success! Synced ${ticketsToInsert.length} mock tickets to database.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Sync/Import Tickets (For migrating from LocalStorage)
exports.syncTickets = async (req, res) => {
    try {
        const tickets = req.body; // Array of tickets
        if (!Array.isArray(tickets)) {
            return res.status(400).json({ message: "Input must be an array of tickets" });
        }

        let createdCount = 0;
        let errors = [];

        for (const t of tickets) {
            try {
                // Check exist by code
                const existing = await Ticket.findOne({ code: t.code });
                if (!existing) {
                    await new Ticket(t).save();
                    createdCount++;
                }
            } catch (err) {
                errors.push({ code: t.code, error: err.message });
            }
        }

        res.json({ message: `Imported ${createdCount} tickets.`, errors: errors.length > 0 ? errors : undefined });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
