const Product = require('../models/Product');
const User = require('../models/User'); // Import User Model
const Ticket = require('../models/Ticket'); // Import Ticket Model (NEW)

// Using Helper to sync admin user (No change here)
const syncAdminUser = async (productData) => {
    try {
        if (!productData.adminEmail || !productData.adminPassword) return;

        // Sync or Create Admin User
        await User.findOneAndUpdate(
            { email: productData.adminEmail },
            {
                email: productData.adminEmail,
                password: productData.adminPassword, // In real app, hash this!
                name: `Admin ${productData.name}`,
                role: 'PRODUCT_ADMIN',
                productId: productData.id,
                avatar: `https://ui-avatars.com/api/?name=${productData.name}&background=random`
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`👤 User Admin berhasil disinkronkan untuk produk: ${productData.id}`);
    } catch (err) {
        console.error("Gagal menyinkronkan user admin:", err);
    }
};

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();

        // 1. Fetch ticket stats Aggregation
        const ticketStats = await Ticket.aggregate([
            {
                $group: {
                    _id: "$product", // Group by Product ID
                    total: { $sum: 1 },
                    active: {
                        $sum: {
                            $cond: [{ $in: ["$status", ["new", "pending", "in_progress", "critical", "open"]] }, 1, 0]
                        }
                    },
                    resolved: {
                        $sum: {
                            $cond: [{ $in: ["$status", ["resolved", "closed"]] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Convert array to map for easy lookup
        const statsMap = {};
        ticketStats.forEach(stat => {
            statsMap[stat._id] = stat;
        });

        // Transform data to match frontend expectation (MOCK_PRODUCTS structure)
        const transformedData = {};
        products.forEach(p => {
            const stats = statsMap[p.id] || { total: 0, active: 0, resolved: 0 };

            transformedData[p.id] = {
                id: p.id,
                name: p.name,
                description: p.description,
                icon: p.icon,
                adminEmail: p.adminEmail,
                adminPassword: p.adminPassword,
                // Real stats fetched from DB
                trend: [], // Trend could be complex calculation, keep empty for now
                stats: {
                    total: stats.total,
                    active: stats.active,
                    resolved: stats.resolved,
                    satisfaction: 98 // Hardcoded for now, or calc average rating
                },
                dist: [],
                activity: []
            };
        });

        res.json(transformedData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a product
exports.createProduct = async (req, res) => {
    try {
        console.log('📦 CREATE Product Request:', req.body);
        const { id, name, description, icon, adminEmail, adminPassword } = req.body;

        // Basic validation
        if (!id || !name) {
            console.log('❌ Validation failed: missing id or name');
            return res.status(400).json({ message: "ID and Name are required" });
        }

        // Check if existing
        const existing = await Product.findOne({ id });
        if (existing) {
            console.log('❌ Product already exists:', id);
            return res.status(400).json({ message: "Product ID already exists" });
        }

        const newProduct = new Product({ id, name, description, icon, adminEmail, adminPassword });
        const savedProduct = await newProduct.save();

        console.log('✅ Product created:', savedProduct.id);

        // SYNC ADMIN
        await syncAdminUser(savedProduct);

        res.status(201).json(savedProduct);
    } catch (err) {
        console.error('❌ Create Product Error:', err);
        res.status(400).json({ message: err.message });
    }
};

// Update a product (or create if not exists - upsert)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Use upsert: true to create if doesn't exist
        const updatedProduct = await Product.findOneAndUpdate(
            { id: id },
            updates,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (updatedProduct) {
            // SYNC ADMIN
            await syncAdminUser(updatedProduct);
        }

        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findOneAndDelete({ id: id });

        if (!deleted) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Also delete the associated admin user if they exist
        if (deleted.adminEmail) {
            await User.findOneAndDelete({ email: deleted.adminEmail });
            console.log(`👤 Associated admin user deleted: ${deleted.adminEmail}`);
        }

        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
