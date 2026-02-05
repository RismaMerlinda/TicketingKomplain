const Product = require('../models/Product');
const User = require('../models/User'); // Import User Model

// Helper to sync admin user
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
        console.log(`👤 Admin user synced for product: ${productData.id}`);
    } catch (err) {
        console.error("Failed to sync admin user:", err);
    }
};

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();

        // Transform data to match frontend expectation (MOCK_PRODUCTS structure)
        const transformedData = {};
        products.forEach(p => {
            transformedData[p.id] = {
                id: p.id,
                name: p.name,
                description: p.description,
                icon: p.icon,
                adminEmail: p.adminEmail,
                adminPassword: p.adminPassword,
                // Default stats for now
                trend: [],
                stats: { total: 0, active: 0, resolved: 0, satisfaction: 0 },
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
