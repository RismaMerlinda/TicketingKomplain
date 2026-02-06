require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Data users yang akan di-seed
const users = [
    {
        email: 'admin@superadmin.co.id',
        password: 'password123',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        productId: null,
        avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff'
    },
    {
        email: 'jokiinformatika@gmail.com',
        password: 'joki123',
        name: 'Joki Informatika Admin',
        role: 'PRODUCT_ADMIN',
        productId: 'joki-informatika',
        avatar: 'https://ui-avatars.com/api/?name=Joki+Informatika&background=8b5cf6&color=fff'
    },
    {
        email: 'orbitbilliard.id@gmail.com',
        password: 'orbit123',
        name: 'Orbit Billiard Admin',
        role: 'PRODUCT_ADMIN',
        productId: 'orbit-billiard',
        avatar: 'https://ui-avatars.com/api/?name=Orbit+Billiard&background=ec4899&color=fff'
    },
    {
        email: 'hi@catatmak.com',
        password: 'catatmak123',
        name: 'Catatmak Admin',
        role: 'PRODUCT_ADMIN',
        productId: 'catatmak',
        avatar: 'https://ui-avatars.com/api/?name=Catatmak&background=f59e0b&color=fff'
    }
];

async function seedUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing users (optional - comment out if you want to keep existing data)
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Insert users
        const createdUsers = await User.insertMany(users);
        console.log(`✅ Successfully seeded ${createdUsers.length} users:`);

        createdUsers.forEach(user => {
            console.log(`   - ${user.email} (${user.role})`);
        });

        // Close connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
}

// Run the seed function
seedUsers();
