const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ticketingkomplain";

const allAdmins = [
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

async function resetAdmins() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB\n");

        // DELETE ALL USERS FIRST
        const deleteResult = await User.deleteMany({});
        console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing users\n`);

        // INSERT ALL FRESH
        console.log("📝 Inserting fresh admin accounts...\n");
        for (const admin of allAdmins) {
            const newUser = new User(admin);
            await newUser.save();
            console.log(`✅ Created: ${admin.email} | ${admin.role} | Product: ${admin.productId || 'null'}`);

            // Also create profile
            await Profile.findOneAndUpdate(
                { email: admin.email },
                { displayName: admin.name, avatar: "" },
                { upsert: true }
            );
        }

        // VERIFY
        console.log("\n📊 Verifying database...");
        const allUsers = await User.find({});
        console.log(`Total users: ${allUsers.length}\n`);

        allUsers.forEach(u => {
            console.log(`- ${u.email}`);
            console.log(`  Name: ${u.name}`);
            console.log(`  Role: ${u.role}`);
            console.log(`  Password: ${u.password}`);
            console.log(`  Product: ${u.productId || 'null'}\n`);
        });

        console.log("🚀 DONE! All admin accounts are ready.");
        process.exit(0);
    } catch (err) {
        console.error("❌ ERROR:", err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

resetAdmins();
