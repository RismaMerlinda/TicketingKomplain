const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    adminEmail: { type: String },
    adminPassword: { type: String },
    createdAt: { type: Date, default: Date.now },
    // Storing statistical data for compatibility with the mock structure if needed, 
    // though in a real app these would be calculated.
    // We'll leave them optional or generated on read.
}, { timestamps: true, collection: 'products' });

module.exports = mongoose.model('Product', ProductSchema);
