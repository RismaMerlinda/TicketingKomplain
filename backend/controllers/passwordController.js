const PasswordLog = require('../models/Password');
const User = require('../models/User');

// @desc    Update User Password and Log the change
// @route   POST /api/passwords/update
exports.updateAndLogPassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        const emailStr = email.trim(); // Case sensitive email in DB? usually lower

        // 1. Cari user berdasarkan email
        const user = await User.findOne({ email: emailStr });
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // 2. Verifikasi password lama
        if (user.password !== oldPassword) {
            return res.status(400).json({ message: "Password lama tidak sesuai" });
        }

        // 3. Simpan Riwayat ke tabel password_logs
        await PasswordLog.create({
            email: user.email,
            oldPassword: oldPassword,
            newPassword: newPassword,
            productName: user.productId ? user.productId.toUpperCase() : "SUPER ADMIN",
            updatedBy: user.name,
            productId: user.productId
        });

        // 4. Update Password di tabel users
        user.password = newPassword;
        await user.save();

        console.log(`✅ User password updated for: ${user.email}`);

        // 5. REVERSE SYNC: Update juga di tabel products jika dia adalah PRODUCT_ADMIN
        if (user.role === 'PRODUCT_ADMIN' && user.productId) {
            const Product = require('../models/Product');

            // Gunakan regex untuk pencarian ID produk yang case-insensitive agar lebih robust
            const updatedProduct = await Product.findOneAndUpdate(
                { id: { $regex: new RegExp(`^${user.productId}$`, 'i') } },
                { adminPassword: newPassword },
                { new: true }
            );

            if (updatedProduct) {
                console.log(`📦 Product table synced for: ${user.productId}`);
            } else {
                console.error(`⚠️ Failed to sync Product table. Product ID '${user.productId}' not found.`);
            }
        }

        console.log(`🔑 Password updated and logged for: ${email}`);
        res.json({ message: "Password berhasil diperbarui dan riwayat dicatat" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get all password change logs (For Super Admin)
// @route   GET /api/passwords/logs
exports.getPasswordLogs = async (req, res) => {
    try {
        const logs = await PasswordLog.find().sort({ createdAt: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
