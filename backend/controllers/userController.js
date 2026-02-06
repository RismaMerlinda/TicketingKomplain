const User = require('../models/User');
const Product = require('../models/Product'); // Untuk referensi nama produk jika perlu

// Get all users (admins)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();

        // Transform data if needed specifically for frontend table
        // But sending raw is also fine usually
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a user (Admin)
exports.createUser = async (req, res) => {
    try {
        const { email, password, name, role, productId } = req.body;

        // Validasi dasar
        if (!email || !password || !name || !role) {
            return res.status(400).json({ message: "Semua kolom wajib diisi" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        const newUser = new User({
            email,
            password,
            name,
            role,
            productId: role === 'PRODUCT_ADMIN' ? productId : null
        });

        const savedUser = await newUser.save();

        // REVERSE SYNC LOGIC:
        // Jika user ini adalah ADMIN PRODUK, maka update juga data di collection 'product'
        // agar data admin (email/password) di kedua tempat tetap SINKRON.
        if (savedUser.productId && savedUser.role === 'PRODUCT_ADMIN') {
            await Product.findOneAndUpdate(
                { id: savedUser.productId },
                {
                    adminEmail: savedUser.email,
                    adminPassword: savedUser.password // Note: In real app, avoid overwriting with raw password if hashed
                }
            );
            console.log(`📦 Product synced with new admin: ${savedUser.productId}`);
        }

        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update User
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const PasswordLog = require('../models/Password');

        // Ambil data user lama sebelum update
        const oldUser = await User.findById(id);
        if (!oldUser) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Cek jika password sedang diupdate
        if (updates.password && updates.password !== oldUser.password) {
            await PasswordLog.create({
                email: oldUser.email,
                oldPassword: oldUser.password,
                newPassword: updates.password,
                updatedBy: oldUser.name,
                productId: oldUser.productId,
                productName: oldUser.productId ? oldUser.productId.toUpperCase() : "SUPER ADMIN"
            });
            console.log(`🔑 Riwayat password dicatat di MongoDB untuk: ${oldUser.email}`);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

        // REVERSE SYNC: Update Product if linked
        if (updatedUser.productId && updatedUser.role === 'PRODUCT_ADMIN') {
            await Product.findOneAndUpdate(
                { id: updatedUser.productId },
                {
                    adminEmail: updatedUser.email,
                    adminPassword: updatedUser.password
                }
            );
            console.log(`📦 Product synced with updated admin: ${updatedUser.productId}`);
        }

        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Sync Users from Products (Utility)
exports.syncUsers = async (req, res) => {
    try {
        const products = await Product.find();
        let createdCount = 0;
        let errors = [];

        for (const prod of products) {
            if (prod.adminEmail && prod.adminPassword) {
                try {
                    // Check if user exists
                    const existing = await User.findOne({ email: prod.adminEmail });
                    if (!existing) {
                        const newUser = new User({
                            email: prod.adminEmail,
                            password: prod.adminPassword,
                            name: `Admin ${prod.name}`,
                            role: 'PRODUCT_ADMIN',
                            productId: prod.id,
                            avatar: `https://ui-avatars.com/api/?name=${prod.name}&background=random`
                        });
                        await newUser.save();
                        createdCount++;
                    }
                } catch (err) {
                    errors.push({ product: prod.name, error: err.message });
                }
            }
        }

        res.json({
            message: `Sync complete. Created ${createdCount} users.`,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "User berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
