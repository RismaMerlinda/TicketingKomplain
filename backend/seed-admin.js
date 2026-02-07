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
        console.log("✅ Terhubung ke MongoDB");

        // Hapus log lama agar bersih (hanya menyisakan riwayat asli nanti)
        await PasswordLog.deleteMany({});
        console.log("🗑️ Koleksi password_logs telah dibersihkan.");

        // Masukkan/Update akun asli dari frontend
        for (const admin of realAdmins) {
            // Sinkron ke Tabel Users (untuk Login & Password)
            await User.findOneAndUpdate(
                { email: admin.email },
                admin,
                { upsert: true, new: true }
            );

            // Sinkron ke Tabel Profiles (untuk Display Name)
            await Profile.findOneAndUpdate(
                { email: admin.email },
                { displayName: admin.name, avatar: "" },
                { upsert: true }
            );

            console.log(`✅ Data asli siap untuk: ${admin.email}`);
        }

        console.log("\n🚀 SEMUA DATA FRONTEND TELAH DISINKRONKAN KE MONGODB!");
        console.log("Riwayat (password_logs) akan terisi otomatis saat Anda ganti password di web.");
        process.exit(0);
    } catch (err) {
        console.error("❌ ERROR:", err.message);
        process.exit(1);
    }
}

runSeed();
