
const mongoose = require('mongoose');
const User = require('./models/User'); // Assuming User model is in models/User.js

require('dotenv').config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ticketing-db');
        console.log("Connected to MongoDB");

        const email = 'admin@superadmin.co.id';
        const user = await User.findOne({ email: email });

        if (user) {
            console.log(`User found: ${user.email}`);
            console.log(`Password in DB: '${user.password}'`); // Quote it availability to see spaces
            console.log(`Password length: ${user.password.length}`);
        } else {
            console.log("User not found");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

checkUser();
