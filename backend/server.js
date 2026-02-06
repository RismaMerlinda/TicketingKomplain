require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase API data limit incase sync is large

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);

// Debug route to check database
app.get('/api/debug/db', async (req, res) => {
    try {
        const Product = require('./models/Product');
        const count = await Product.countDocuments();
        const products = await Product.find().limit(10);
        res.json({
            status: 'connected',
            database: 'ticketingkomplain',
            collection: 'products',
            totalProducts: count,
            products: products
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Base route
app.get('/', (req, res) => {
    res.send('Ticketing System API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
