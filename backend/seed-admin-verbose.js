const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
const PasswordLog = require('./models/Password');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ticketingkomplain";

const realAdmins = [
    {
        email: "admin@superadmin.co.id",
        password: "password123",
        name: "Super Admin",
        role: "SUPER_ADMIN",
        productId: null
    },
    {
        email: "orbitbilliard.id@gmail.com",
        password: "orbit123",
        name: "Admin Orbit Billiard",
        role: "PRODUCT_ADMIN",
        productId: "orbit"
    },
    {
        email: "hi@catatmak.com",
        password: "catatmak123",
        name: "Admin Catatmark",
        role: "PRODUCT_ADMIN",
        productId: "catatmak"
    },
    {
        email: "jokiinformatika@gmail.com",
        password: "joki123",
        name: "Admin Joki Informatika",
        role: "PRODUCT_ADMIN",
        productId: "joki"
    }
];

async function runSeed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Terhubung ke MongoDB\n");

        // Hapus log lama agar bersih
        await PasswordLog.deleteMany({});
        console.log("🗑️ Koleksi password_logs telah dibersihkan.\n");

        // Masukkan/Update akun asli dari frontend
        for (const admin of realAdmins) {
            console.log(`📝 Processing: ${admin.email}...`);

            // Sinkron ke Tabel Users (untuk Login & Password)
            const savedUser = await User.findOneAndUpdate(
                { email: admin.email },
                admin,
                { upsert: true, new: true }
            );
            console.log(`   ✅ User saved: ${savedUser.email} | ${savedUser.role}`);

            // Sinkron ke Tabel Profiles (untuk Display Name)
            await Profile.findOneAndUpdate(
                { email: admin.email },
                { displayName: admin.name, avatar: "" },
                { upsert: true }
            );
            console.log(`   ✅ Profile saved for: ${admin.email}\n`);
        }

        // Verify
        const allUsers = await User.find({});
        console.log(`\n✅ Total users in database: ${allUsers.length}`);
        allUsers.forEach(u => {
            console.log(`   - ${u.email} | ${u.role} | Product: ${u.productId || 'null'}`);
        });

        console.log("\n🚀 SEMUA DATA FRONTEND TELAH DISINKRONKAN KE MONGODB!");
        console.log("Riwayat (password_logs) akan terisi otomatis saat Anda ganti password di web.");
        process.exit(0);
    } catch (err) {
        console.error("❌ ERROR:", err);
        console.error("Stack:", err.stack);
        process.exit(1);
    }
}

runSeed();
