const mongoose = require('mongoose');

// Schema untuk menyimpan riwayat / audit log perubahan password
const PasswordUpdateSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    oldPassword: {
        type: String
    },
    newPassword: {
        type: String,
        required: true
    },
    productName: {
        type: String
    }, // Nama produk admin (misal: Joki) yang mengganti
    updatedBy: {
        type: String
    }, // Nama admin yang melakukan perubahan
    productId: {
        type: String
    }
}, {
    timestamps: true,
    collection: 'password_logs'
});

// AUTO SYNC LOGIC:
// Setiap kali ada entry baru di password_logs (riwayat), 
// kita otomatis update password tersebut di tabel 'users' & 'products'.
// Ini memastikan user bisa login ke dashboard dengan password terbaru.
PasswordUpdateSchema.post('save', async function (doc) {
    console.log(`🚀 [SYNC HOOK TRIGGERED] for: ${doc.email}`);
    try {
        const User = mongoose.model('User');
        const Product = mongoose.model('Product');

        // 1. Update password di tabel users (Collection: users)
        const updatedUser = await User.findOneAndUpdate(
            { email: doc.email },
            { password: doc.newPassword },
            { new: true }
        );

        if (updatedUser) {
            console.log(`✅ [SYNC HOOK] Password updated in 'users' for: ${doc.email}`);

            // 2. Jika user ini adalah PRODUCT_ADMIN, update juga di tabel products
            const isProductAdmin = ['PRODUCT_ADMIN', 'product_admin'].includes(updatedUser.role);
            if (isProductAdmin) {
                const targetProductId = updatedUser.productId || doc.productId;
                if (targetProductId) {
                    const updatedProduct = await Product.findOneAndUpdate(
                        { id: targetProductId },
                        { adminPassword: doc.newPassword },
                        { new: true }
                    );
                    if (updatedProduct) {
                        console.log(`📦 [SYNC HOOK] Password updated in 'products' for ID: ${targetProductId}`);
                    } else {
                        console.log(`⚠️ [SYNC HOOK] Product not found for ID: ${targetProductId}`);
                    }
                } else {
                    console.log(`⚠️ [SYNC HOOK] Target Product ID is missing for Admin: ${doc.email}`);
                }
            }
        } else {
            console.log(`⚠️ [SYNC HOOK] User not found for email: ${doc.email}`);
        }
    } catch (err) {
        console.error("❌ [SYNC HOOK ERROR]:", err.message);
    }
});


module.exports = mongoose.model('Password', PasswordUpdateSchema);

