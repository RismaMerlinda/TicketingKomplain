const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ticketingkomplain";

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB\n");

        const users = await User.find({});
        console.log(`📊 Total Users in Database: ${users.length}\n`);

        console.log("DATABASE USERS:");
        console.log("-".repeat(80));
        users.forEach(u => {
            console.log(`Email:     ${u.email}`);
            console.log(`Name:      ${u.name}`);
            console.log(`Role:      ${u.role}`);
            console.log(`ProductID: ${u.productId || 'null'}`);
            console.log(`Password:  ${u.password}`);
            console.log("-".repeat(80));
        });

        process.exit(0);
    } catch (err) {
        console.error("❌ ERROR:", err.message);
        process.exit(1);
    }
}

checkUsers();
